const pool = require('../db');
const bcrypt = require('bcrypt');
const smsService = require('./sms-service');
const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ErrorModel = require('../dtos/error-dto');
const { TokenExpiredError } = require('jsonwebtoken');

class UserService {
//Регистрация пользователя в БД
    async registration(phoneNumber, password, role, subdivision) {
        if (await this.isExistingUser(phoneNumber)) {
            console.log(`Пользователь с номером ${phoneNumber} уже существует`);
            return `Пользователь с номером ${phoneNumber} уже существует`
        }

        const hashPassword = await bcrypt.hash(password, 3); // Соль нужно вынести куда-то в конфиг

        console.log('Hashed password:', hashPassword);

        const code = this.#generateCode();

        try {
            await smsService.send(phoneNumber, `Ваш код подтверждения: ${code}`);
            console.log('Sending SMS to', phoneNumber, 'with code:', code);
            const result = await pool.query(
                'INSERT INTO users (phone_number, is_activated, activated_code, password, role, subdivision) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [String(phoneNumber), false, String(code), String(hashPassword), role, subdivision]);

            const userDto = new UserDto({
                                            phone: String(result[0].phone), 
                                            id: result[0].id, 
                                            isActivated: result[0].isActivated
                                        });
            const tokens = tokenService.generateTokens(userDto)
            tokenService.saveToken(userDto.id, tokens.refreshToken)
            return { ...tokens, user: userDto }
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
//Авторизация пользователя
    async logIn(phoneNumber, password) {
        if (!await this.isExistingUser(phoneNumber)) {
            return `Пользователь с номером ${phoneNumber} не существует`
        }

        const hashPassword = await bcrypt.hash(password, 3);

        console.log(`PhoneNumber ${phoneNumber} \n hashPassword ${hashPassword}`);
        const result = await pool.query(
            'SELECT * FROM users WHERE phone_number = $1',
            [phoneNumber]
        );

        if (result.rows.length === 0) {
            return Error('Invalid phone number or password');
        }

        const user = result.rows[0];

        const isPasswordValid = await bcrypt.compare(String(password), String(hashPassword))


        if (!isPasswordValid) {
            console.log('Неверный пароль')
            return new ErrorModel({
                errorMessage: 'Неверный пароль'
            })
        }
        console.log('Пароль верный')
        const userDto = new UserDto({
                                        phone: String(user.phone_number),
                                        id: user.id,     
                                        isActivated: user.is_activated,
                                        role: user.role,
                                        subdivision: user.subdivision
                                    });
        const tokens = tokenService.generateTokens(userDto)
        console.log(tokens);
        tokenService.saveToken(userDto.id, tokens.refreshToken)
        return { ...tokens, userInfo: userDto }
    }
//Обновление токена по refreshToken
    async refreshToken(refreshToken) {
        console.log(`refresh token: ${refreshToken}`);

        try {
            const tokenRow = (await pool.query(
                'SELECT user_id FROM tokens WHERE refresh_token = $1',
                [refreshToken]
            )).rows[0];

            if (!tokenRow) {
                return { code: 400, message: "Такого токена нет" };
            }

            const user = (await pool.query(
                'SELECT * FROM users WHERE id = $1',
                [tokenRow.user_id]
            )).rows[0];
            console.log(user);
            if (!user) {
                return { code: 400, message: "Пользователь не найден" };
            }

            const userDto = new UserDto({
                phone: String(user.phone_number),
                id: user.id,
                isActivated: user.is_activated,
                role: user.role,
                subdivision: user.subdivision
            });

            const tokens = tokenService.generateTokens(userDto);

            await tokenService.saveToken(userDto.id, tokens.refreshToken);

            return { ...tokens, userInfo: userDto };

    } catch (error) {
        return { code: 500, message: error?.message };
    }
}

    async logOut(userId) {
        try {
            const result = await pool.query(
                'DELETE FROM tokens WHERE user_id = $1',
                [userId]
            )
        } catch (error) {
            return {code: 500, error: error.message}
        }
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
// получение всех пользователей в системе

    async getAllUsers() {
        try {
            const result = await pool.query('SELECT * FROM users');
        return result.rows;
        } catch (error) {
            return `Не удалось получить список пользователей: ${error.message}`;
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