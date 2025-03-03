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
    
});

export default router;