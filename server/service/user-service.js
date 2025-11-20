const pool = require('../db');
const bcrypt = require('bcrypt');
const smsService = require('./sms-service');

class UserService {
//Регистрация пользователя в БД
    async registration(phoneNumber, password) {
        if (await this.isExistingUser(phoneNumber)) {
            throw new Error(`Пользователь с номером ${phoneNumber} уже существует`);
        }

        const code = this.#generateCode();

        console.log('Registering user with phone number:', phoneNumber);
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            await smsService.send(phoneNumber, `Ваш код подтверждения: ${code}`);

            const user = await pool.query(
                'INSERT INTO users (phone_number, is_activated, activated_code) VALUES ($1, $2, $3) RETURNING *',
                [phoneNumber, false, code]
        );
        } catch (error) {
            console.error('Error during user registration:', error);
        }
    }
//Активация пользователя по номеру телефона и коду активации
    async activateUserByCode(phoneNumber, code) {
        if (!await this.activateCodeIsEqual(phoneNumber, code)) {
            return 'Неверный код активации';
        }
        console.log('Activating user with phone number:', phoneNumber);

        const userId = (await pool.query(
            'SELECT id FROM users WHERE phone_number = $1',
            [phoneNumber]
        )).rows[0].id;
        console.log('User ID to activate:', userId);
        const result = await this.updateUserActivation(userId, true) ;

        return result;
    }
//Обновление статуса активации пользователя по id пользователя
    async updateUserActivation(userId, isActivated) {
        try {
            console.log('Updating activation status for user ID:', userId, 'to', isActivated);
            const result = await pool.query(
                'UPDATE users SET is_activated = $1 WHERE id = $2 RETURNING *',
                [isActivated, userId]
            );
            console.log('User activation updated:', result.rows[0]);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating user activation:', error);
            return "Ошибка при обновлении активации пользователя";
        }
    }

    async isExistingUser(phoneNumber) {
        const query = 'SELECT 1 FROM users WHERE phone_number = $1';
        const values = [phoneNumber];
        const result = await pool.query(query, values);
        return result.rowCount > 0;
    }

    async activateCodeIsEqual(phoneNumber, code) {
        console.log('Checking activation code for phone number:', phoneNumber);
        console.log('Provided activation code:', code);
        const query =  `SELECT 1 
                        FROM users  
                        WHERE phone_number = $1 AND activated_code = $2`;
        const values = [phoneNumber, code];
        const result = await pool.query(query, values);
        console.log('Activation code check result:', result.rowCount);
        return result.rowCount > 0;
    }


    #generateCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
}

module.exports = new UserService();