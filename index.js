import express from 'express';
import pool from './db.js';

const app = express();
app.use(express.json());

const BASE_URL = "http://localhost:3000/"; 


function generateShortCode(length = 6) {
  let s = 'abcdefghijklmnopqrstuvwzyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'
  let idx = Math.floor(Math.random()*s.length);
  let ans= ""
  for(let i=0;i<length;i++){
    ans+=s[idx];
    idx = Math.floor(Math.random()*s.length);
  }
  return ans;
}

// POST: Create a new short URL
app.post('/shorten', async (req, res) => {
  try{
    const {long_url} = req.body;

    //checking if it already exist
    const exists = await pool.query('SELECT * FROM urls where long_url = $1',[long_url]);
    if(exists.rows.length>0){
      return res.json(exists.rows[0]);
    }
    let code = generateShortCode(6);
    const surls = await pool.query('SELECT short_url from urls')
    console.log(surls);

    
  }catch(e){
    console.error(e.message);
    res.status(500).send('SERVER ERROR');
  }
});

// GET: Optional - list all URLs
app.get('/urls', async (req, res) => {
  try{
    const q = await pool.query('SELECT long_url,short_url from urls')
    if(q.rows.length>0){
      return res.json(q.rows);
    } 
  }catch(e){
    console.error(e.message)
    return res.status(500).send('SERVER ERROR')
  }
});


// GET: Redirect short URL to long URL
app.get('/r/:short_url', async (req, res) => {
 
});


app.listen(3000, () => console.log('Server running on port 3000'));
