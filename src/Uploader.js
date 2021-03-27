import axios from 'axios';
import Bottleneck from 'bottleneck';

const CHUNK_SIZE = 1*1024*1024;

/**
 * Uploader for the Unalike API.
 */
class Uploader {

    constructor() {
        
        this.files = {};
        this.events = {};

    }

    setClient(client) {

        this.client = client;

    }

    hasUploads() {

        return Object.keys(this.files).length > 0;
        
    }

    addFile(ref, name, buffer, contentType, repositoryId, actions, parentContentId) {
    
        const size = Buffer.byteLength(buffer);
        const file = new UploadFile(this, ref, name, buffer, size, repositoryId, contentType, actions, parentContentId);
        const maxOffset = Math.max(Math.ceil(size / CHUNK_SIZE), 1);

        // Create chunks
        for (let offset = 0; offset < maxOffset; offset++) {

            const startByte = offset * CHUNK_SIZE;
            const endByte = Math.min(size, (offset+1)*CHUNK_SIZE);
            const chunkSize = endByte - startByte;
            
            const chunkKey = `${offset}_${maxOffset}`;

            file.addChunk(chunkKey, {
                offset,
                maxOffset,
                startByte,
                endByte,
                size: chunkSize,
            });
        }

        this.files[ref] = file;

    }

    async upload(ref) {

        const file = this.files[ref];

        if (!file.isComplete) {
            await file.upload();
        }

    }

    uploadAll() {

        for (const ref of Object.keys(this.files)) {
            this.upload(ref);
        }

    }

    /**
     * Checks if all files have completed. If they have, then emit completed.
     */
    complete() {

        for (const file of Object.values(this.files)) {
            if (!file.isComplete) {
                return;
            }
        }

        this.emit('complete');

    }

    async resume(ref) {

        const file = this.files[ref];
        
        if (!file.isComplete) {
            await file.resume();
        }
        
    }

    resumeAll() {

        for (const ref of Object.keys(this.files)) {
            this.resume(ref);
        }

        this.emit('resumed');

    }
    
    async pause(ref) {

        const file = this.files[ref];
        
        if (!file.isComplete) {
            await file.pause();
        }

    }

    pauseAll() {

        for (const ref of Object.keys(this.files)) {
            this.pause(ref);
        }

        this.emit('paused');

    }

    async cancel(ref) {

        const file = this.files[ref];

        if (!file.isComplete) {
            await file.cancel();
        }
        
    }

    cancelAll() {

        for (const ref of Object.keys(this.files)) {
            this.cancel(ref);
        }

        this.emit('cancelled');

    }

    remove(ref) {

        this.cancel(ref);

        delete this.files[ref];

    }

    reset() {

        for (const ref of Object.keys(this.files)) {
            this.remove(ref);
        }

        this.emit('cancelled');
        this.emit('reset');

    }

    on(event, handler) {
        
        if (!(event in this.events)) {
            this.events[event] = [];
        }

        this.events[event].push(handler);
        
    }

    emit(event, data) {

        if (event in this.events) {
            for (const handler of this.events[event]) {
                handler(data);
            }
        }

    }

    async put(target, body, contentType, cancelToken, onUploadProgress) {

        // const response = 
        await axios.put(target, body, {
            cancelToken,
            headers: {
                'Content-Type': contentType,
            },
            onUploadProgress,
        });

    }
    
}

class UploadFile {

    constructor(uploader, ref, name, buffer, size, repositoryId, contentType, actions, parentContentId) {

        this.uploader = uploader;
        this.ref = ref;
        this.name = name;
        this.buffer = buffer;
        this.size = size;
        this.repositoryId = repositoryId;
        this.parentContentId = parentContentId;
        this.contentType = contentType;
        this.actions = actions;
        this.chunks = {};

        this.target = null;
        
        this.isComplete = false;

    }

    async upload() {

        const ref = this.ref;

        try {

            const response = await this.uploader.client.query(`query upload($repositoryId: ID!, $contentType: String!, $chunks: JSON) { 
                    upload(repositoryId: $repositoryId, contentType: $contentType, chunks: $chunks) {
                            url
                            key
                            chunks
                        }
                    }`, {
                repositoryId: this.repositoryId,
                contentType: this.contentType,
                chunks: this.chunks,
            });

            const upload = response.data.upload;

            // For each upload chunk set the chunks corresponding key and down download target
            this.target = upload;

        } catch (error) {

            return this.uploader.emit('error', {ref, error});

        }

        for (const chunkKey in this.chunks) {
            if (!this.chunks[chunkKey].isComplete) {
                this.chunks[chunkKey] = Object.assign(this.chunks[chunkKey], this.target.chunks[chunkKey]);
            }
        }

        await this.uploadChunks();

    }

    async uploadChunks() {

        const ref = this.ref;

        this.uploader.emit('uploading', {ref});
        
        try {

            this.queue = new Bottleneck({
                maxConcurrent: 3,
            });

            // Reset chunks loaded if not complete
            for (const chunkKey in this.chunks) {
                if (!this.chunks[chunkKey].isComplete) {
                    this.chunks[chunkKey].loaded = 0;
                }
            }
            
            // Fiter chunks by what's complete and queue the rest
            const tasks = Object.keys(this.chunks)
                    .filter((chunkKey) => !this.chunks[chunkKey].isComplete)
                    .map((chunkKey) => this.queue.schedule(() => this.uploadChunk(chunkKey)));

            await Promise.all(tasks);

            await this.complete();

        } catch (error) {

            if (error.constructor.name == 'BottleneckError') {
                return;
            }

            this.uploader.emit('error', {ref, error});

        }
      
    }

    /**
     * After all chunks are done.
     */
    async complete() {

        const ref = this.ref;

        try {

            const {data} = await this.uploader.client.query(`query uploadCallback($key: String, $contentType: String!, $name: String!, $repositoryId: ID!, $actions: [String], $chunks: JSON, $parentContentId: ID) { 
                uploadCallback(key: $key, contentType: $contentType, name: $name, repositoryId: $repositoryId, actions: $actions, chunks: $chunks, parentContentId: $parentContentId) {
                            id
                            name
                            data
                        }
                    }`, {
                key: this.target.key,
                contentType: this.contentType,
                name: this.name,
                repositoryId: this.repositoryId,
                actions: this.actions,
                parentContentId: this.parentContentId,
                chunks: this.chunks,
            });
            
            const content = data.uploadCallback;
            
            this.isComplete = true;
        
            // Upload complete and we have our content
            this.uploader.emit('fileComplete', {ref, content});

            this.uploader.complete();

        } catch (error) {

            this.uploader.emit('error', {ref, error});

        }

    }

    addChunk(key, chunk) {

        this.chunks[key] = chunk;

        this.chunks[key].isComplete = false;

    }

    add(key, chunk) {

        this.chunks[key] = chunk;

    }

    async uploadChunk(chunkKey) {

        // console.log('uploadChunk', chunkKey);

        const CancelToken = axios.CancelToken;
        const cancelSource = CancelToken.source();
        this.chunks[chunkKey].cancelSource = cancelSource;

        const slice = this.buffer.slice(this.chunks[chunkKey].startByte, this.chunks[chunkKey].endByte);
        const ref = this.ref;

        await this.uploader.put(this.chunks[chunkKey].url, slice, this.contentType, cancelSource.token, (progressEvent) => {

            const loaded = progressEvent.loaded;
            const total = progressEvent.total;
            const offset = this.chunks[chunkKey].offset;
            const maxOffset = this.chunks[chunkKey].maxOffset;

            this.uploader.emit('chunkProgress', {ref, loaded, total, maxOffset, offset});

            this.chunks[chunkKey].loaded = loaded;

            this.progress();
            
        });

        this.chunks[chunkKey].isComplete = true;
        this.chunks[chunkKey].loaded = this.chunks[chunkKey].size;
        
        const offset = this.chunks[chunkKey].offset;
        const maxOffset = this.chunks[chunkKey].maxOffset;

        this.uploader.emit('chunkProgress', {ref, loaded: this.chunks[chunkKey].size, total: this.chunks[chunkKey].size, maxOffset, offset});
       
        this.progress();

    }

    progress() {

        const total = this.size;
        let loaded = 0;
        
        for (const chunkKey in this.chunks) {
            loaded += this.chunks[chunkKey].loaded;
        }

        this.uploader.emit('progress', {ref: this.ref, loaded, total});

    }

    async resume() {

        this.uploader.emit('fileResumed', {ref: this.ref, chunks: this.chunks});

        await this.upload();
        
    }

    async pause() {

        // Cancel any requests
        for (const chunkKey in this.chunks) {

            if ('cancelSource' in this.chunks[chunkKey]) {
                this.chunks[chunkKey].cancelSource.cancel();
            }
        }

        // Stop the queue
        if (this.queue) {
            await this.queue.stop();
        }

        this.uploader.emit('filePaused', {ref: this.ref, chunks: this.chunks});

    }

    /**
     * Cancel the queue and don't save any informaiton.
     */
    async cancel() {

        // Stop the queue
        if (this.queue) {
            this.queue.stop();
        }

        // Cancel any requests
        for (const chunkKey in this.chunks) {

            const chunk = this.chunks[chunkKey];

            if ('cancelSource' in chunk) {
                chunk.cancelSource.cancel();
            }
        }

        this.isComplete = true;

        this.uploader.emit('fileCancelled', {ref: this.ref});

    }
    
}

export default Uploader;
