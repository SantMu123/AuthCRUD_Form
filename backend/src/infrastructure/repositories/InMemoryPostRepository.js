// backend/src/infrastructure/repositories/InMemoryPostRepository.js
const PostRepository = require('../../domain/repositories/PostRepository');

class InMemoryPostRepository extends PostRepository {
    constructor() {
        super();
        this.posts = [];
    }

    async create(post) {
        this.posts.push(post);
        return post;
    }

    async findAll() {
        return this.posts;
    }

    // Implementar otros métodos si es necesario
}

module.exports = InMemoryPostRepository;
