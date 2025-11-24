module.exports = class ErrorDto {
    message;
    htttpStatus;

    constructor(model) {
         this.htttpStatus = model.htttpStatus || 500;
        this.errorMessage = model.errorMessage || 'Ошибка сервера';
    }
}