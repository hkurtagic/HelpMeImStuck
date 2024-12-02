import express, { Request, Response} from "npm:express"

const app = express()

app.get("/", (req: Request, res: Response) => {res.send("Hello World!")})
app.get("/a", (req: Request, res: Response) => {res.send("testfile!")})

app.listen(Deno.env.get("PORT"), () => {
    console.log(`Server running on port ${Deno.env.get("PORT")}`)
})
