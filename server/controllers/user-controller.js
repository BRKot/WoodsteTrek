class UserController {
    async registration(req, res, next) {
        try {
        
        } catch (error) {
        
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
        
        } catch (error) {
        
        }
    }

    async refresh(req, res, next) {
        try {
        
        } catch (error) {
        
        }
    }

    async getUsers(req, res, next) {
        console.log('Ghbcewncwncnwecnwonciwuecwbckwciubwcw')
        try {
            res.json(['user1', 'user2']);
        } catch (error) {
            res.json('virenvenv')
        }
    }
}

module.exports = new UserController();