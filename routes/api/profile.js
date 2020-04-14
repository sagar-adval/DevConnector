const express = require('express')
const request = require('request')
const axios = require('axios')
const config = require('config')
const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')
const { check, validationResult } = require('express-validator')
const router = express.Router()


//@route                 GET api/profile/me
//@description           Get current user's profile
//@access                Private
router.get('/me', auth, async (req, res) => {
    try {
        Profile.findOne({ user: req.user.id }).populate('user', "name avatar").exec(function (err, profiles) {
            if (!profiles) {
                return res.status(400).json("no profiles")
            }
            res.json(profiles)
        }

        )
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
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
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
    if (company) profileFields.company = company
    if (website) profileFields.website = website
    if (location) profileFields.location = location
    if (bio) profileFields.bio = bio
    if (designation) profileFields.designation = designation
    if (githubusername) profileFields.githubusername = githubusername

    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }

    //Build Social Object
    profileFields.social = {}

    if (youtube) profileFields.social.youtube = youtube
    if (facebook) profileFields.social.facebook = facebook
    if (linkedin) profileFields.social.linkedin = linkedin
    if (twitter) profileFields.social.twitter = twitter
    if (instagram) profileFields.social.instagram = instagram

    try {
        let profile = await Profile.findOne({ user: req.user.id })

        if (profile) {
            //Update
            profile = await Profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
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
        Profile.find().populate('user', "name avatar").exec(function (err, profiles) {
            if (!profiles) {
                return res.status(400).json("no profiles")
            }
            res.json(profiles)
        })

    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }
})

//@route                 GET api/profile/user/:user_id
//@description           Get Profile by user_id
//@access                Public
router.get('/user/:user_id', async (req, res) => {
    try {
        Profile.findOne({ user: req.params.user_id }).populate('user', "name avatar").exec(function (err, profile) {
            if (!profile) {
                return res.status(400).json("Profile Not Found")
            }
            res.json(profile)
        })

    } catch (err) {
        console.log(err.message)
        if (err.kind == 'ObjectId') {
            return res.status(400).json("Profile Not Found")
        }
        res.status(500).send('Server Error')
    }
})

//@route                 DELETE api/profile
//@description           Delete profile, user and posts
//@access                Private
router.delete('/', auth, async (req, res) => {
    try {
        //Remove Profile
        await Profile.findOneAndRemove({ user: req.user.id })
        //Remove User
        await User.findOneAndRemove({ _id: req.user.id })

        res.json('User Deleted')

    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }
})

//@route                 PUT api/profile/experience
//@description           Add profile experience
//@access                Private
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('from', 'From Date is required').not().isEmpty()
]], async (req, res) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id })

        profile.experience.unshift(newExp)

        await profile.save()

        res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')

    }
})


//@route                 DELETE api/profile/experience/:exp_id
//@description           Delete experience from profile
//@access                Private
router.delete('/experience/:exp_id', [auth], async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        //Get remove index
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id)

        profile.experience.splice(removeIndex, 1)

        await profile.save()

        res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }
})


//@route                 PUT api/profile/education
//@description           Add profile education
//@access                Private
router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of study is required').not().isEmpty(),
    check('from', 'From Date is required').not().isEmpty()
]], async (req, res) => {

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id })

        profile.education.unshift(newEdu)

        await profile.save()

        res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')

    }
})


//@route                 DELETE api/profile/experience/:exp_id
//@description           Delete experience from profile
//@access                Private
router.delete('/education/:edu_id', [auth], async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })

        //Get remove index
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id)

        profile.education.splice(removeIndex, 1)

        await profile.save()

        res.json(profile)
    } catch (err) {
        console.log(err.message)
        res.status(500).send('Server Error')
    }
})

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get('/github/:username', async (req, res) => {
    try {
      const uri = encodeURI(
        `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc`
      );
      const headers = {
        'user-agent': 'node.js',
        Authorization: `token ${config.get('GITHUBTOKEN')}`
      };
  
      const gitHubResponse = await axios.get(uri, { headers });
      return res.json(gitHubResponse.data);
    } catch (err) {
      console.error(err.message);
      return res.status(404).json({ msg: 'No Github profile found' });
    }
  });
module.exports = router