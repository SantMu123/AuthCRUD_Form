// backend/src/application/services/PostService.js
const Post = require('../../domain/models/Post');

class PostService {
    constructor(postRepository) {
        this.postRepository = postRepository;
    }

    async createPost({ title, content, imagePath }) {
        const post = new Post({
            id: Date.now(),
            title,
            content,
            imagePath,
            createdAt: new Date(),
        });

        return await this.postRepository.create(post);
    }

    async getAllPosts() {
        return await this.postRepository.findAll();
    }

    // Otros métodos de negocio según necesidades
}

module.exports = PostService;
