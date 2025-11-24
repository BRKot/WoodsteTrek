module.exports = class UserDto {
    phone;
    id;
    isActivated;

    constructor(model) {
        this.phone = model.phone;
        this.id = model.id;
        this.isActivated = model.isActivated
    }
}