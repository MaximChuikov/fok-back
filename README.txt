<h1>User methods</h1>


url: /user/rent
params: ?set=0&days_in_set=4
response:


url: /user/rent-request
params: body {
    variant_id,
    phone,
    requests [
        {
            date,
            start,
            end
        },
        ...
    ]
}
response: 'ok'


<h1>Manager</h1>

url: /manager/rent-requests
params: variant_id
response: BIG...


url: /manager/deny-request
params: {
    variant_id,
    body {
        text: 'reason'
    }
}
response: ok


url: /manager/delete-confirmed-request
params: {
    variant_id,
    body {
        text: 'reason'
    }
}
response: ok


/confirm-request



<h1>Events</h1>

url: /event/change-rent
params: -
response: {
    event: //[new, delete],
    data: //[ ?, request_id]
}

url: /event/new-rent-request
params: -
response: {
    data: [
      {
          date,
          start,
          end
      },
      ...
  ]
}




