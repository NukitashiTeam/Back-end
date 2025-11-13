const { version } = require("mongoose");
const { type } = require("os");

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
                description: 'Development server'
            },
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
                }
            }
        }

    },
    apis: ['./Router/*.js']
}

module.exports = option;