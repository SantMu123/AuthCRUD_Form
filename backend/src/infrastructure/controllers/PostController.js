// backend/src/infrastructure/controllers/PostController.js
class PostController {
    constructor(postService) {
        this.postService = postService;
    }

    createPost = async (req, res) => {
        try {
            const { title, content } = req.body;
            const imagePath = req.file ? req.file.path : null;

            const newPost = await this.postService.createPost({ title, content, imagePath });
            res.status(201).json({ message: 'Post creado exitosamente!', post: newPost });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    getAllPosts = async (req, res) => {
        try {
            const posts = await this.postService.getAllPosts();
            res.status(200).json({ posts });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    // Otros métodos según necesidades
}

module.exports = PostController;
