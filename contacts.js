const fs = require('fs/promises');
const path = require('path');
const shortid = require('shortid');

const contactsPath = path.join(__dirname, '/db/contacts.json');
const contactList = fs.readFile(contactsPath, "utf8");

async function listContacts() {
    try {
        console.table(JSON.parse(await contactList))
        return JSON.parse(await contactList);
        } catch (error){
        return console.error(error.message);
    };
};

async function getContactById(contactId) {
  try {    
      const getContact = JSON.parse(await contactList)
          .find(({ id }) => id === contactId);

    return getContact;
  } catch (error) {
    return console.error(error.message);
  }
}

async function removeContact(contactId) {
    try {
        const contacts = await contactList;
        const contactsUpdated = JSON.parse(contacts).filter(({ id }) => id !== contactId);
            await fs.writeFile(
            contactsPath,
            JSON.stringify(contactsUpdated, null, 2),
                'utf-8'
            
        );
        console.table(contactsUpdated);
        return contactsUpdated;
        
 }catch (error) {
        return console.error(error.message);
    };
}

 async function addContact(name, email, phone) {
     try {
         const contacts = JSON.parse(await contactList);
        
         const newContact = { id: shortid.generate(), name, email, phone };
         
         const listUpdated = [ ...contacts, newContact ];
         console.table(newContact);
         console.table(listUpdated);

         await fs.writeFile(
             contactsPath,
             JSON.stringify(listUpdated, null, 2),
             'utf-8'
         );

  }catch (error) {
        return console.error(error.message);
    };
};

module.exports = { listContacts,getContactById,removeContact,addContact };