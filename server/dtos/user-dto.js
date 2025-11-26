module.exports = class UserDto {
    phone;
    id;
    isActivated;
    role;
    subdivision;

    constructor(model) {
        this.phone = model.phone;
        this.id = model.id;
        this.isActivated = model.isActivated
        this.role = model.role || null
        this.subdivision = model.subdivision || null
    }
}