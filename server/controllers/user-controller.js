const userService = require('../service/user-service');

class UserController {
    async registration(req, res, next) {
        try {
            console.log('Received registration request with data:', req.body);
            userService.registration(req.body.phoneNumber, req.body.password)
        } catch (error) {
            console.error('Error during registration:', error);
        }
    }

    async login(req, res, next) {
        try {
        
        } catch (error) {
        
        }
    }

    async logout(req, res, next) {
        try {
        
        } catch (error) {
        
        }
    }

    async activate(req, res, next) {
        try {
            console.log('Received activation request with data:', req.body);
            const result = await userService.activateUserByCode(
                req.body.phone_number,
                req.body.code
            );
            console.log('Activation result:', result);
            res.json(result);
        } catch (error) {
            console.error('Activation error:', error);
            res.status(500).json({ message: 'Activation error', error: error.message });
        }
    }

    async refresh(req, res, next) {
        try {
        
        } catch (error) {
        
        }
    }

    async getUsers(req, res, next) {
        try {
            res.json(['user1', 'user2']);
        } catch (error) {
            res.json('virenvenv')
        }
    }
}

module.exports = new UserController();