import expresss from 'express';
import cors from 'cors';

const app = expresss();

app.use(cors());
app.use(expresss.json({limit: "16kb"}));
app.use(expresss.urlencoded({extended: true, limit: "16kb"}));
app.use(expresss.static("public"));

export default app;