// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const supabase = require('./supabase');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// 1. Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SkillBridge Backend is running!' });
});

// 2. GET all projects (supports optional search and category filters)
app.get('/api/projects', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.ilike('category', category);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Error fetching projects:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST a new project
app.post('/api/projects', async (req, res) => {
  try {
    const { title, category, budget, duration, description, contact_email } = req.body;

    if (!title || !category || !budget || !duration || !description) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields.' });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([{ title, category, budget, duration, description, contact_email, status: 'Open' }])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    console.error('Error creating project:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST an application for a project
app.post('/api/applications', async (req, res) => {
  try {
    const { project_id, applicant_name, applicant_email, portfolio_url, pitch } = req.body;

    if (!applicant_name || !applicant_email || !pitch) {
      return res.status(400).json({ success: false, error: 'Name, email, and pitch are required.' });
    }

    const { data, error } = await supabase
      .from('applications')
      .insert([{ project_id, applicant_name, applicant_email, portfolio_url, pitch }])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    console.error('Error submitting application:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. GET all applications
app.get('/api/applications', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*, projects(title, category)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Error fetching applications:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. POST/Upsert student profile
app.post('/api/profiles', async (req, res) => {
  try {
    const { full_name, email, portfolio_url, bio, skills } = req.body;

    if (!full_name || !skills) {
      return res.status(400).json({ success: false, error: 'Full name and skills are required.' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert([{ full_name, email, portfolio_url, bio, skills }])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (err) {
    console.error('Error saving profile:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. GET student profiles
app.get('/api/profiles', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    console.error('Error fetching profiles:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});