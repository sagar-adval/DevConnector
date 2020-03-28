const express = require('express')
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const {check, validationResult} = require('express-validator')
const router = express.Router()


//@route                 GET api/profile/me
//@description           Get current user's profile
//@access                Private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id})
        profile.populate('User', ['name', 'avatar'])

        if(!profile){
            return res.status(400).json({msg: "User doesn't exist"})
        }
        
        res.json(profile)
    } catch (err) {
        console.log(err.message);
        res.status(500).send('Server Error')
    }
})

//@route                 POST api/profile
//@description           Create or Update User profile
//@access                Private

router.post('/', [auth, [
    check('designation', 'Designation is required').not().isEmpty(), 
    check('skills', 'Please tell us about your skills').not().isEmpty()
]], async (req, res)=> {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }
    const {
        company,
        location,
        website,
        bio,
        skills,
        designation,
        githubusername,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook
      } = req.body;

      //Build Profile Object 
      const profileFields = {}
      profileFields.user = req.user.id
      if(company) profileFields.company = company
      if(website) profileFields.website = website
      if(location) profileFields.location = location
      if(bio) profileFields.bio = bio
      if(designation) profileFields.designation = designation
      if(githubusername) profileFields.githubusername = githubusername

      if(skills){
          profileFields.skills = skills.split(',').map(skill => skill.trim())
      }

      //Build Social Object
      profileFields.social = {}

      if(youtube) profileFields.social.youtube = youtube
      if(facebook) profileFields.social.facebook = facebook
      if(linkedin) profileFields.social.linkedin = linkedin
      if(twitter) profileFields.social.twitter = twitter
      if(instagram) profileFields.social.instagram = instagram

      try {
          let profile = await Profile.findOne({user:req.user.id})

            if(profile){
                //Update
                profile = await Profile.findOneAndUpdate(
                    {user: req.user.id},
                    {$set: profileFields},
                    {new: true}
                    )

                return res.json(profile)
                
            }
            
            //Create
            profile = new Profile(profileFields)

            await profile.save()

            res.json(profile)

      } catch (err) {
          console.log(err.message)
          res.status(500).send('Server Error')
      }
})


//@route                 GET api/profile
//@description           Get all Profiles
//@access                Public
router.get('/', async (req, res) => {
    try {
        let profiles = await Profile.find({}).populate('User', ['name', 'avatar'])
        res.json(profiles)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }
})


module.exports = router