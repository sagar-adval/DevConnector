const express = require('express')
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {check, validationResult} =  require('express-validator')
const User = require('../../models/User')
const config = require('config')

const router = express.Router()


//@route                 POST api/users
//@description           Register User
//@access                Public
router.post('/',[
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('password', 'Password should contain atleast 6 characters').isLength({min: 6})
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {name, email, password} =  req.body

    try{

        //Check if user already exists
        let user = await User.findOne({email})
        if(user){
            return res.status(400).json({errors:[{msg: 'User already exists!'}]})
        }

        const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
        })
        user = new User({
            name, email, password, avatar
        })
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt)
        
        await  user.save()

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, config.get('JWTSECRETKEY'), {
            expiresIn: 360000
        }, (err, token) => {
            if(err){
                throw err
            }
            res.json({token})
        })
    } catch(err){
        console.log(err.message)
        res.status(500).send('Server Error')
    }
      
})

module.exports = router