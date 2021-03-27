const uniqueTestName = new Date().getTime();

const mock = {
    content: {
        type: 'story',
        name: `test-content1${uniqueTestName}`,
        data: {
            test: 'test',
        },
        tags: ['TEST1', 'Test2'],
    },
    delta: {
        ops: [
            {insert: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce placerat justo sit amet varius dictum. Cras hendrerit lacus at ex sodales, nec pharetra ex faucibus. Nullam vitae est lacus. Sed accumsan, arcu vel pellentesque tristique, velit augue fringilla sem, at ultrices quam metus eu libero. Praesent dictum et risus quis convallis. Nunc tempor, est ut iaculis viverra, enim ante egestas turpis, ut pharetra turpis sapien tristique velit. Duis convallis sem vel metus molestie, eget eleifend mi maximus. Curabitur laoreet bibendum tincidunt. Nunc imperdiet, diam ut mollis bibendum, turpis nisl posuere elit, non pulvinar erat nisl vitae ipsum. Integer id venenatis mauris.jjjsd  \n'},
        ],
    },
};

module.exports = mock;
