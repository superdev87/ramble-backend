# reciteBackend

## Contact API

  http://localhost:8006/api/v1/contact

### create (post)

  http://localhost:8006/api/v1/contact/create
  
  body : 

    - owner(email)
    - name(string)
    - contact_number(string)
    - email(email)
    - location(string)
    - category(string)("Personal" or "Business")
    - Notes(string)
  
### edit (post)

  http://localhost:8006/api/v1/edit
  
  body:

    - id(ObjectID)
    - owner(email)
    - name(string)
    - contact_number(string)
    - email(email)
    - location(string)
    - category(string)("Personal" or "Business")
    - Notes(string)
  
### getContact (get)

  http://localhost:8006/api/v1/getContact

  body:

    - owner(email)
