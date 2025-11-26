const userService = require('../service/user-service');

class UserController {
    async registration(req, res, next) {
        try {
            console.log('Received registration request with data:', req.body);
            const result = await userService.registration(req.body.phoneNumber, 
                                                            req.body.password,
                                                            req.body.role,
                                                            req.body.sudivision)
            console.log(result);
            res.json(result);
        } catch (error) {
            res.json(error)
            console.error('Error during registration:', error);
        }
    }

    async login(req, res, next) {
        try {
            console.log('viruebvnerverv');
            console.log(req.body);
            const result = await userService.logIn(req.body.phoneNumber, req.body.password);
            res.json(result)
        } catch (error) {
            console.log(error);
            res.json(error);
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
            console.log(req.body);
            const result = await userService.refreshToken(req.body.refresh_token);
            res.json(result)
        } catch (error) {
            console.log(error);
            res.json(error);
        }
    }

    async getUsers(req, res, next) {
        try {
            const result = await userService.getAllUsers();
            res.json(result);
        } catch (error) {
            res.json(error)
        }
    }
}

module.exports = new UserController();