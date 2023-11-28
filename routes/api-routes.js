const Router = require('express')
const api_router = new Router()

const {createLink, getLinks, putLink} = require("../controllers/controller");

api_router.post('/links', async (req, res) => {
    try {
        const data = await createLink(req.body.link)
        console.log('POST /links', data)
        res.json(data)
    }catch (e) {
        res.status(500).json(e)
    }

})
api_router.get('/links', async (req, res) => {
    try {
        res.json(await getLinks())
    }catch (e) {
        res.status(500).json(e)
    }
})

api_router.put('/links/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await putLink(id, status)
        res.json(`Статус ${id} обновлен на ${status}`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = api_router