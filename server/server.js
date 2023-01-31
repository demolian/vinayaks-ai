import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import { Configuration, OpenAIApi } from 'openai'

dotenv.config()

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
    res.status(200).send({
        message: 'Hello from Vinayak!',
    })
})

app.post('/', async (req, res) => {
    try {
      const prompt = req.body.prompt;

      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `${prompt}`,
        max_tokens: 4000,
        temperature: 0.7,
        top_p: 1, 
       /* prompt: `${prompt}`,
        // Risk 
        temperature: 0.7,
        // Response length
        max_tokens: 4000,
        top_p: 1,
        // similar reply
        frequency_penalty: 0.5,
        presence_penalty: 0, */
      }); 

      res.status(200).send({
        bot: response.data.choices[0].text
      });

    } catch (error) {
       console.error(error)
       res.status(500).send(error || 'Something went wrong');
    }
})

app.listen(3000, () => console.log('Server is running on port http://localhost:3000'))