import 'regenerator-runtime/runtime';

import {version} from '../package.json';
import axios from 'axios';

import ContentResource from './resources/ContentResource';
import RepositoryResource from './resources/RepositoryResource';
import ModelResource from './resources/ModelResource';

import ResponseError from './errors/ResponseError';
import QueryError from './errors/QueryError';

import Interceptors from './Interceptors';

import Transformer from './Transformer';
import Uploader from './Uploader'; 
import Utils from './Utils'; 

const DEFAULT_TIMEOUT = 10000;

/**
 * Unalike main query class.
 */
class Client {

    constructor() {

        // Options
        this.debug = false;
        
        this.options = {
            timeout: DEFAULT_TIMEOUT,
            headers: {
                'Unalike-Agent': `unalike.js-${version}`,
                'Content-Type': 'application/json; charset=utf-8',
            },
        };

        // Resources
        this.content = (id) => {
            const resource = new ContentResource(this);
            if (id) {
                resource.id(id);
            }
            return resource;
        };

        this.repository = (id) => {
            const resource = new RepositoryResource(this);
            if (id) {
                resource.id(id);
            }
            return resource;
        };
        
        this.model = (id) => {
            const resource = new ModelResource(this);   
            if (id) {
                resource.id(id);
            }
            return resource;
        };

        // Interceptors
        this.interceptors = {
            request: new Interceptors(),
            fulfilled: new Interceptors(),
            rejected: new Interceptors(),
        };

    }

    setTimeout(timeout) {
        this.options.timeout = timeout;
    }

    setOption(key, value) {
        this.options[key] = value;
    }

    setApi(url) {

        this.url = url;

    }

    setDebug(debug) {

        this.debug = debug;

    }

    getUrl() {

        return this.url;

    }

    getVersion() {
    
        return `unalike.js-${version}`;

    }

    setToken(token) {

        if (token !== undefined && token !== null) {

            this.token = token;

            // This allow us to path people to different API. You know, enterprise customers. If we ever get them :)
            if (token.indexOf('__') > -1 && token.indexOf('__') < 40) {
                const url = token.split('__')[0];
                this.url = url.indexOf('localhost') > -1 ? `http://${url}` : `https://${url}`;
            }

            this.options.headers['x-auth'] = token;

        }

    }

    setHeader(name, value) {

        this.options.headers[name] = value;

    }

    buildUrl(url, parameters) {

        let qs = '';
        
        for (const key in parameters) {
            if (parameters.hasOwnProperty(key)) {
                const value = parameters[key];
                qs += `${encodeURIComponent(key) }=${ encodeURIComponent(value) }&`;
            }
        }
        
        if (qs.length > 0) {
            qs = qs.substring(0, qs.length - 1); // chop off last "&"
            url = `${url }?${ qs}`;
        }
    
        return url;
    }

    requiresToken() {

        if (this.token === undefined || this.token === null) {
            throw new Error(`Where's the key?`);
        }
        
    }

    async ping() {

        const response = await this.request(`${this.url}/ping`, Object.assign(this.options, {
            method: 'GET',
        }));

        if (this.debug) {
            console.log('unalike-js', 'url', '/ping');
            console.log('unalike-js', 'method', 'GET');
            console.log('unalike-js', 'res', response);
        }

        return response;

    }

    async get(endpoint, params) {

        const url = this.buildUrl(`${this.url}${endpoint}`, params);

        const response = await this.request(url, Object.assign({}, this.options, {
            method: 'GET',
        }));

        if (this.debug) {
            console.log('unalike-js', 'url', url);
            console.log('unalike-js', 'method', 'GET');
            console.log('unalike-js', 'response', response);
        }

        return response;
        
    }

    async post(endpoint, params, data, options) {

        const url = this.buildUrl(`${this.url}${endpoint}`, params);

        const response = await this.request(url, Object.assign({}, this.options, {
            method: 'POST',
            data,
        }, options));

        if (this.debug) {
            console.log('unalike-js', 'url', url);
            console.log('unalike-js', 'method', 'POST');
            console.log('unalike-js', 'response', response);
        }

        return response;

    }

    async put(endpoint, params, data) {

        this.requiresToken();

        const url = this.buildUrl(`${this.url}${endpoint}`, params);

        const response = await this.request(url, Object.assign({}, this.options, {
            method: 'PUT',
            data,
        }));

        if (this.debug) {
            console.log('unalike-js', 'url', url);
            console.log('unalike-js', 'method', 'PUT');
            console.log('unalike-js', 'response', response);
        }

        return response;

    }

    async delete(endpoint, params) {

        this.requiresToken();

        const url = this.buildUrl(`${this.url}${endpoint}`, params);

        const response = await this.request(url, Object.assign({}, this.options, {
            method: 'DELETE',
        }));

        if (this.debug) {
            console.log('unalike-js', 'url', url);
            console.log('unalike-js', 'method', 'DELETE');
            console.log('unalike-js', 'response', response);
        }

        return response;

    }

    // Main queries
    async query(query, variables, path = '/query') {

        const url = this.buildUrl(`${this.url}${path}`);

        const response = await this.request(url, Object.assign({}, this.options, {
            method: 'POST',
            data: {
                query,
                variables,
            },
        }));

        if (response && response.data.errors && response.data.errors.length > 0) {
            throw new QueryError(response);
        }

        // Tidy up a little
        response.data = response.data.data;
        
        if (this.debug) {
            console.log('unalike-js', 'url', url);
            console.log('unalike-js', 'method', 'POST');
            console.log('unalike-js', 'response', response);
        }

        return response;

    }

    async request(url, options) {

        // Simple timeout
        const timeoutTimer = setTimeout(() => {
            throw new Error('Request timed out');
        }, options.timeout);

        try {

            // Request options intercepters
            this.interceptors.request.forEach(options);
            
            // Make response
            const response = await axios(url, options);
            
            clearTimeout(timeoutTimer);

            // Clean headers
            // End response to user
            const endResponse = {
                headers: response.headers,
                status: response.status,
                data: response.data,
            };

            if (endResponse.status >= 400) {
                
                throw new ResponseError(endResponse);

            } else {
            
                // Dispatch fulfilled intercepters
                this.interceptors.fulfilled.forEach(endResponse);

            }

            return endResponse;

        } catch (err) {

            clearTimeout(timeoutTimer);

            if ('response' in err) { 

                const endResponse = {
                    headers: err.response.headers,
                    status: err.response.status,
                    data: err.response.data,
                };

                const responseError = new ResponseError(endResponse);

                // Dispatch rejected intercepters
                this.interceptors.rejected.forEach(responseError);
                    
                throw responseError;

            }

            throw err;

        }
         
    }

}

export default {
    Client, 
    Transformer,
    Utils,
    Uploader,
};
