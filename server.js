const express = require('express');
const mongoose = require('mongoose');
const Mentor = require('./Schema/mentorSchema');
const Student = require('./Schema/studentSchema');
const app = express();



app.use(express.json());


app.post('/mentors', async (req, res) => {
    try {
      const mentor = new Mentor({
        name: req.body.name,
        students: []
      });
  
      await mentor.save();
      res.status(201).json(mentor);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create mentor' });
    }
  });
  app.post('/students', async (req, res) => {
    try {
      const student = new Student({
        name: req.body.name,
        mentor: req.body.mentorId
      });
  
      await student.save();
  
      // Update the mentor's students array
      await Mentor.updateOne({ _id: req.body.mentorId }, { $push: { students: student._id } });
  
      res.status(201).json(student);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create student' });
    }
  });

  app.get('/mentors', async (req, res) => {
    try {
      const mentors = await Mentor.find().populate('students');
      res.json(mentors);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve mentors' });
    }
  });

  app.post('/multiplestudents', async (req, res) => {
    try {
      const mentorId = req.body.mentorId;
      const studentNames = req.body.studentNames;
  
      // Find the mentor
      const mentor = await Mentor.findById(mentorId);
      if (!mentor) {
        return res.status(404).json({ error: 'Mentor not found' });
      }
  
      
      const students = [];
      for (const name of studentNames) {
        const student = new Student({
          name: name,
          mentor: mentorId
        });
  
        await student.save();
        students.push(student);
      }
  
      
      mentor.students.push(...students.map(student => student._id));
      await mentor.save();
  
      res.status(201).json(students);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create students' });
    }
  });

  app.get('/mentors/:mentorId/students', async (req, res) => {
    try {
      const mentorId = req.params.mentorId;
  
      
      const mentor = await Mentor.findById(mentorId).populate('students');
      if (!mentor) {
        return res.status(404).json({ error: 'Mentor not found' });
      }
  
      res.json(mentor.students);
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve students' });
    }
  });




const PORT = 5000


mongoose.connect('mongodb+srv://Tony:Gugan25@cluster0.m9kcie1.mongodb.net/mentorsdb', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB', err));


app.listen(PORT,()=>{
    console.log(`App is listening on ${PORT}`)
})