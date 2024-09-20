// backend/src/domain/models/Post.js
class Post {
    constructor({ id, title, content, imagePath, createdAt }) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.imagePath = imagePath;
        this.createdAt = createdAt;
    }
}

module.exports = Post;
