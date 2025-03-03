import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = express.Router();

router.post('/register', (req, res) => {
    const {username, password} = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);

    try {
        const insertUser = db.prepare(`INSERT INTO users (username, password)
        VALUES (?, ?)`);
        const result =insertUser.run(username, hashedPassword);

        const defaultToDo = `Hello : Add your first todo`;
        const insertToDO = db.prepare(`INSERT INTO todos (user_id, task)
        VALUES (?, ?)`);
        insertToDO.run(result.lastInsertRowid, defaultToDo);

        const token = jwt.sign({ id: result.lastInsertRowid }, process.env.JWT_SECRETKEY, 
        {expiresIn: '24h'});
        res.json({ token });
    } catch (err) {
        console.log(err.message);
        res.sendStatus(503);
    }   

});

router.post('/login', (req, res) => {
    const  { username, password } = req.body;

    try {
        const getUser = db.prepare('SELECT * FROM users WHERE username = ?')
        const user = getUser.get(username)

        // if we cannot find a user associated with that username, return out from the function
        if (!user) { return res.status(404).send({ message: "User not found" }) }

        const passwordIsValid = bcrypt.compareSync(password, user.password)
        // if the password does not match, return out of the function
        if (!passwordIsValid) { return res.status(401).send({ message: "Invalid password" }) }
        console.log(user)

        // then we have a successful authentication
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '24h' })
        res.json({ token })
    } catch (err) {
        console.log(err.message);
        res.sendStatus(503);
    }
});

export default router;