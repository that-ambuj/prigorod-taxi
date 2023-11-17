/* eslint-disable */
export default async () => {
    const t = {};
    return { "@nestjs/swagger": { "models": [[import("./auth/dto/signup.dto"), { "SignUpDto": { phone_number: { required: true, type: () => String, example: "+7 9876543219" }, name: { required: false, type: () => String, example: "John Doe" }, city: { required: true, type: () => String }, village: { required: true, type: () => String } } }], [import("./auth/entities/auth.entity"), { "Auth": {} }]], "controllers": [] } };
};