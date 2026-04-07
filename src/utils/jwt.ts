import  jwt from "jsonwebtoken";

export const generateJWT = (id : string) : string => {
    const token = jwt.sign({id} , process.env.JWT_SECRET , {
        expiresIn: '100000000s'
    });
    return token;
};

