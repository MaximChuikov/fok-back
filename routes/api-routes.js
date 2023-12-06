const Router = require('express')
const api_router = new Router()

const {createLink, getLinks, putLink, queuePutLink, queueCreateLink, dropLinks} = require("../controllers/controller");

api_router.post('/links', async (req, res) => {
    try {
        const data = await queueCreateLink(req.body.link)
        console.log(data, 'Ссылка добавлена в очередь')
        res.json(data)
    }catch (e) {
        res.status(500).json(e)
    }
})
api_router.post('/linksConsumer', async (req, res) => {
    try {
        const data = await createLink(req.body.link)
        console.log(data, 'Ссылка создана')
        res.json(data)
    }catch (e) {
        res.status(500).json(e)
    }
})
api_router.get('/links', async (req, res) => {
    try {
        const links = await getLinks()
        console.log('Ссылки получены', links)
        res.json(links)
    }catch (e) {
        res.status(500).json(e)
    }
})

api_router.put('/links/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await queuePutLink(id, status)
        res.json(`Статус ${status} на id:${id} добавлен в очередь на изменение`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

api_router.put('/linksConsumer/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await putLink(id, status)
        res.json(`Статус ${status} на id:${id} изменен!`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

api_router.delete('/links', async (req, res) => {
    try {
        await dropLinks()
        console.log('Дропнул ссылки')
        res.json(`Все ссылка удалены!`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = api_router