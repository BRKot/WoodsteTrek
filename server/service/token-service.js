const jwt = require('jsonwebtoken');
const pool = require('../db');

class TokenService {
    generateTokens(payload) {   
        console.log('Payload received:', payload);
        const plainPayload = this.convertToPlainObject(payload);
        const accessToken = jwt.sign(plainPayload, process.env.JWT_ACCESS_SECRET, {expiresIn: process.env.JWT_ACCESS_EXPIRES_IN});
        const refreshToken = jwt.sign(plainPayload, process.env.JWT_REFRESH_SECRET, {expiresIn: process.env.JWT_REFRESH_EXPIRES_IN});
        return {
            accessToken,
            refreshToken
        };
    }

    async saveToken(userId, refreshToken) {
        try {
            const tokenData = await pool.query(
            'SELECT * FROM tokens WHERE user_id = $1',
            [userId]
        );
        if (tokenData.rows.length > 0) {
            const result = await pool.query(
                'UPDATE tokens SET refresh_token = $1 WHERE user_id = $2 RETURNING *',
                [refreshToken, userId]
            );
            return;
        }

        const result = await pool.query (
            'INSERT INTO tokens (user_id, refresh_token) VALUES ($1, $2) RETURNING *',
            [parseInt(userId), String(refreshToken)]);
        console.log(result);
        console.log('Сохраняем токен');    
        return result
        } catch (error) {
            console.log(error);
            return error
        } 
    }

    convertToPlainObject(obj) {
        // Если это уже plain object, возвращаем как есть
        if (obj instanceof Object && obj.constructor === Object) {
            return obj;
        }
        
        // Если это экземпляр класса, преобразуем в plain object
        if (obj instanceof Object) {
            return { ...obj };
        }
        
        // Если это что-то другое, возвращаем как есть (вызовет ошибку в jwt.sign)
        return obj;
    }
}

module.exports = new TokenService();