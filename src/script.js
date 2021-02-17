import '@/style.scss'
import '@comp/additional-info/additional-info.scss'
import Card from '@comp/card/card'
import eduList from '@comp/edu-list/edu-list'

const cards = document.querySelectorAll('.card');
cards.forEach(cardElem => {
    const cardZoneElem = cardElem.closest('.card-container');
    const card = new Card(cardElem, cardZoneElem !== null ? cardZoneElem : undefined);
});

eduList();