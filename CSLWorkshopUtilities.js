const appid = '255710'

// sessionid
const cookie = document.cookie
const search = /sessionid=(\w+);/.exec(cookie)
const sessionID = search ? search[1] : null

const collections = []

let lastSelectedCollectionID = undefined

async function getMyCollections() {
    const data = await (await fetch('https://steamcommunity.com/sharedfiles/ajaxgetmycollections', {
        method: 'POST',
        body: {
            appid,
            publishedfileid,
            sessionid: sessionID
        }
    })).json()
    for (const collection of data['all_collections']['publishedfiledetails'])
        collections.push({
            title: collection['title'],
            publishedfileid: collection['publishedfileid']
        })
}

async function addToCollection(collectionID, title) {
    const body = {
        sessionID,
        publishedfileid,
        [`collections[${collectionID}][add]`]: true,
        [`collections[${collectionID}][title]`]: title
    }
    const data = await (await fetch('https://steamcommunity.com/sharedfiles/ajaxaddtocollections', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: new URLSearchParams(Object.entries(body)).toString()
    }))
}

async function subscribe() {
    const body = {
        id: publishedfileid,
        appid,
        sessionid: sessionID
    }
    const data = await fetch('https://steamcommunity.com/sharedfiles/subscribe', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: new URLSearchParams(Object.entries(body)).toString()
    })
}

async function addAndSubscribe() {
    const btn = document.querySelector('#addAndSubscribeBtn')
    const selector = document.getElementById('collectionsSelect')
    const id = selector.selectedOptions[0].value
    const title = selector.selectedOptions[0].innerText
    await SubscribeItem()
    await addToCollection(id, title)
}

async function run() {
    // get all collections
    await getMyCollections()

    // read config
    lastSelectedCollectionID = await GM.getValue('lastSelectedCollectionID')
    console.log(lastSelectedCollectionID)

    // insert dom
    const container = document.querySelector('.game_area_purchase_margin')

    let selectInnerHTML = ''
    for (const collection of collections) {
        selectInnerHTML += `<option value=${collection['publishedfileid']} ${lastSelectedCollectionID === collection['publishedfileid'] ? 'selected' : ''}>${collection['title']}</option>`
    }

    const insertComponentHTML = `
        <div style='text-align: right'>
            <select id='collectionsSelect'>
                ${selectInnerHTML}
            </select>
            <button id='addAndSubscribeBtn'>Add to collection and subscribe</button>
        </div>
    `

    container.insertAdjacentHTML('beforebegin', insertComponentHTML)

    document.querySelector('#addAndSubscribeBtn').addEventListener('click', async () => { await addAndSubscribe() })

    // record selected collection id
    document.querySelector('#collectionsSelect').addEventListener('change', async (e) => {
        const t = e.target.selectedOptions[0].value
        if (t) {
            lastSelectedCollectionID = t
            await GM.setValue('lastSelectedCollectionID', t)
        }
    })

}

run().then()