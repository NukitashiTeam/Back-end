const { version } = require("mongoose");
const { type } = require("os");
const swaggerAutogen = require('swagger-autogen')();

const option = {
    definition:{
        openapi: '3.0.0',
        info: {
            title: 'Moody blues',
            version: '1.0.0',
            description: 'API documentation for Moody Blues application',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Local Development'
            },
            {
                url: 'https://moody-blue-597542124573.asia-southeast2.run.app',
                description: 'Production (Google Cloud)'
            }
        ],
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: '64adbc2f8ee9c9f1b4d9d4d5'
                        },
                        name:{
                            type: 'string',
                            example: 'Nguyen Van A'
                        },
                        username: {
                            type: 'string',
                            example: 'masadthu123'
                        },
                        email: {
                            type: 'string',
                            example: 'user@example.com'
                        },
                        password:{
                            type: 'string',
                            example: 'masadthu123'
                        },
                        hobby:{
                            type: 'string',
                            example: 'Reading, Traveling'
                        },
                        sex:{
                            type: 'string',
                            example: 'nam',
                        },
                        avatar:{
                            type: 'string',
                            example: '/avatars/masadthu123/avatar.png'
                        },
                        dob: {
                            type: 'date',
                            example: '1990-01-01'
                        },
                        tick: {
                            type: 'boolean',
                            example: false
                        }
                    }
                },
                Music: {
                    type: 'object',
                    properties: {
                        track_id: { type: 'string', example: '1291234567' },
                        title: { type: 'string', example: 'Hello' },
                        artist: { type: 'string', example: 'Adele' },
                        album: { type: 'string', example: '25' },
                        genre: { type: 'string', example: 'Pop' },
                        mp3_url: { type: 'string', example: 'https://audio-ssl.itunes.apple.com/...' },
                        image_url: { type: 'string', example: 'https://is4-ssl.mzstatic.com/image.jpg' },
                        is_premium: { type: 'boolean', example: false },
                        release_date: { type: 'string', format: 'date-time', example: '2015-10-23T07:00:00Z' },
                        mood: { type: 'string', example: '' }
                    }
                },
                Mood: {
                    type: 'object',
                    properties: {
                        _id:           { type: 'string',  example: '507f1f77bcf86cd799439011' },
                        name:          { type: 'string',  example: 'Vui vẻ' },
                        icon:          { type: 'string',  example: '😄' },
                        createdAt:     { type: 'string',  format: 'date-time', example: '2025-01-01T00:00:00.000Z' },
                        updatedAt:     { type: 'string',  format: 'date-time', example: '2025-01-01T00:00:00.000Z' }
                    }
                },
                Playlist: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '6566f1b4d9d4d54adbc2f8ee' },
                        title: { type: 'string', example: 'Nhạc chill cuối tuần' },
                        thumbnail: { type: 'string', example: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745' },
                        description: { type: 'string', example: 'Những bản nhạc lofi nhẹ nhàng để học tập' },
                        type: { type: 'string', enum: ['random', 'manual'], example: 'manual' },
                        mood: { type: 'string', example: 'Thư giãn' },
                        context: { type: 'string', example: 'Học bài' },
                        songs: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    songId: { type: 'string', example: '64adbc2f8ee9c9f1b4d9d4d5' },
                                    title: { type: 'string', example: 'Hello' },
                                    artist: { type: 'string', example: 'Adele' },
                                    addedAt: { type: 'string', format: 'date-time', example: '2025-01-01T08:00:00Z' }
                                }
                            }
                        },
                        owner: { type: 'string', example: '64adbc2f8ee9c9f1b4d9d4d5', description: 'ID của người dùng sở hữu playlist' },
                        isPublic: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time', example: '2025-01-01T00:00:00.000Z' },
                        updatedAt: { type: 'string', format: 'date-time', example: '2025-01-01T00:00:00.000Z' }
                    }
                }
            },
            securitySchemes: {
                bearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                },
            },
            responses: {
                Unauthorized: {
                    description: 'Access token is missing or invalid',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string', example: 'Truy cập bị từ chối. Token không hợp lệ.' }
                                }
                            }
                        }
                    }
                },
                Forbidden: {
                    description: 'Access denied. Requires higher privileges (Admin) or ownership.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string', example: 'Bạn không có quyền thực hiện hành động này.' }
                                }
                            }
                        }
                    }
                },
                NotFound: {
                    description: 'The specified resource was not found',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string', example: 'Không tìm thấy tài nguyên.' }
                                }
                            }
                        }
                    }
                },
                BadRequest: {
                    description: 'Invalid input provided',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string', example: 'Dữ liệu đầu vào không hợp lệ.' }
                                }
                            }
                        }
                    }
                },
                ServerError: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string', example: 'Lỗi server.' }
                                }
                            }
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        

    },
    apis: ['./Router/*.js']
}

module.exports = option;