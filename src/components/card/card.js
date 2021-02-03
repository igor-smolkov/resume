import './card.scss'

export default class Card {
    constructor(element) {
        this.elementCard = element;
        this.elementCardFrontside = this.elementCard.querySelector('.card__frontside');
        this.elementCardBackside = this.elementCard.querySelector('.card__backside');
        this.elementCardZone = this.elementCard.closest('.card-zone');

        this.draggingElementCard = null;
        this.draggingCursorShiftX = null;
        this.draggingCursorShiftY = null;
        this.isDraggingEnterZone = false;
        this.isFlipping = false;

        this.elementCardFrontside.querySelectorAll('a[href="copy/"').forEach(elementContactToCopy => {
            elementContactToCopy.addEventListener('click', (e)=>{this.clickToCopy(e)});
        });
        
        this.elementCard.addEventListener('pointerdown', (e)=>{this.onCardPointerDown(e)});
        this.elementCard.addEventListener('pointerup', (e)=>{this.onCardPointerUp(e)});

        this.elementCard.addEventListener('dragstart', (e)=>{this.onCardDragStart(e)});

        this.elementCardZone.addEventListener('dragenter', (e)=>{this.onCardZoneDragEnter(e)});
        this.elementCardZone.addEventListener('dragleave', (e)=>{this.onCardZoneDragLeave(e)});
        this.elementCardZone.addEventListener('dragover', (e)=>{this.onCardZoneDragOver(e)});
        this.elementCardZone.addEventListener('drop', (e)=>{this.onCardZoneDrop(e)});

        document.addEventListener('pointermove', (e)=>{this.onDocPointerMove(e)});
        document.addEventListener('pointerup', (e)=>{this.onDocPointerUp(e)});

        document.addEventListener('dragover', (e)=>{this.onDocDragOver(e)}, true);
        document.addEventListener('drop', (e)=>{this.onDocDrop(e)}, true);
    }
    onCardPointerDown(e) {
        this.elementCard.classList.remove('card_animation_rotate-left');
        this.elementCard.classList.remove('card_animation_rotate-right');
        this.elementCard.classList.remove('card_animation_opacity');
        this.elementCard.classList.remove('card_animation_scale');

        if (e.target.classList.contains('drag-field') && this.draggingElementCard === null) {
            this.draggingElementCard = this.elementCard;
            this.draggingElementCard.setAttribute('draggable', true);
            console.log('draggable');

            // this.draggingElementCard = e.target.closest('.card');
            // if (this.draggingElementCard !== null) {
            //     this.draggingElementCard.dataset.shiftX = e.clientX - this.draggingElementCard.getBoundingClientRect().left; //+34;
            //     this.draggingElementCard.dataset.shiftY = e.clientY - this.draggingElementCard.getBoundingClientRect().top; //+30;
            //     this.draggingElementCard.classList.add('card_dragged');
            //     this.draggingElementCard.style.zIndex += 2;
            //     document.body.classList.add('grabbing');
            //     this.draggingElementCard.style.left = e.pageX - this.draggingElementCard.dataset.shiftX + 'px';//-6 + 'px';
            //     this.draggingElementCard.style.top = e.pageY - this.draggingElementCard.dataset.shiftY + 'px';//-10 + 'px';
            //     window.getSelection().removeAllRanges();
            // }
        } else if (e.target.classList.contains('flip-field')) {
            this.elementCardFrontside.classList.toggle('card__frontside_none');
            this.elementCardBackside.classList.toggle('card__backside_none');
            this.isFlipping = true;
        }
    }
    onCardPointerUp(e) {
        if (this.isFlipping) {
            this.elementCardFrontside.classList.toggle('card__frontside_none');
            this.elementCardBackside.classList.toggle('card__backside_none');
            this.isFlipping = false;
        }
    }
    onCardDragStart(e) {
        if (this.draggingElementCard === null) return;
        this.isDraggingEnterZone = false;
        this.draggingCursorShiftX = e.clientX - this.draggingElementCard.offsetLeft;
        this.draggingCursorShiftY = e.clientY - this.draggingElementCard.offsetTop;
        console.log('onCardDragStart');
    }
    onCardZoneDragEnter(e) {
        if (this.draggingElementCard === null) return;
        this.isDraggingEnterZone = true;
        this.elementCardZone.classList.add('card-zone_aimed');
        console.log('onCardZoneDragEnter');
    }
    onCardZoneDragLeave(e) {
        if (this.draggingElementCard === null) return;
        this.isDraggingEnterZone = false;
        this.elementCardZone.classList.remove('card-zone_aimed');
        console.log('onCardZoneDragLeave');
    }
    onCardZoneDragOver(e) {
        if (this.draggingElementCard === null) return;
        e.preventDefault();
        console.log('onCardZoneDragOver');
        this.isDraggingEnterZone = true;
        this.elementCardZone.classList.add('card-zone_aimed');
    }
    onCardZoneDrop(e) {
        this.isDraggingEnterZone = true;
        this.onDrop(e)      
    }
    onDocPointerMove(e) {
        // if (this.draggingElementCard !== null) {
        //     this.draggingElementCard.style.left = e.pageX - this.draggingElementCard.dataset.shiftX + 'px';
        //     this.draggingElementCard.style.top = e.pageY - this.draggingElementCard.dataset.shiftY + 'px';
        //     window.getSelection().removeAllRanges();
        // }
        if (this.isFlipping && (!e.target.classList.contains('flip-field') || e.pointerType !== 'mouse')) {
            this.elementCard.classList.add('card_animation_scale');
            this.isFlipping = false;
        }
    }
    onDocPointerUp(e) {
        // this.draggingElementCard = null;
        // document.body.classList.remove('grabbing');
        this.isFlipping = false;
    }
    onDocDragOver(e) {
        if (this.draggingElementCard === null) return;
        this.draggingElementCard.classList.add('card_none');
        this.elementCardZone.classList.add('card-zone_abandoned');
        e.preventDefault();
        window.getSelection().removeAllRanges();
        console.log('onDocDragOver');
    }
    onDocDrop(e) {
        this.onDrop(e)
    }
    onDrop(e) {
        if (this.draggingElementCard === null) return;
        this.draggingElementCard.classList.remove('card_none');
        this.draggingElementCard.classList.add('card_animation_opacity');
        if (!this.isDraggingEnterZone) {
            this.draggingElementCard.classList.add('card_dragged');
            this.draggingElementCard.style.left = e.clientX - this.draggingCursorShiftX + 'px';
            this.draggingElementCard.style.top = e.clientY - this.draggingCursorShiftY + 'px';
        } else {
            this.draggingElementCard.style.left = '0';
            this.draggingElementCard.style.top = '0';
            this.draggingElementCard.classList.remove('card_dragged');
            this.elementCardZone.classList.remove('card-zone_abandoned');
        }
        this.draggingElementCard.setAttribute('draggable', false);
        this.draggingElementCard = null;
        console.log('onDocDrop');
        console.log('undraggable');
        this.elementCardZone.classList.remove('card-zone_aimed');
    }

    clickToCopy(e) {
        e.preventDefault();
        if (e.target.innerText[0] === '+') {
            this.copy(e.target.innerText.split('').filter(char => char != '-').join(''), 'Номер скопирован в буфер обмена');
        } else {
            this.copy(e.target.innerText, 'Адрес скопирован в буфер обмена');
        }        
    }
    copy(copied, msg) {
        const copyMessageElement = document.createElement('div');
        copyMessageElement.classList.add('copy-message');
        copyMessageElement.innerText = msg;
        document.body.append(copyMessageElement)

        const input = document.createElement('input');
        input.value = copied;
        copyMessageElement.append(input);
        input.select();
        document.execCommand("copy");
        input.remove();

        setTimeout(()=>{ copyMessageElement.remove(); }, 1000)
    }
}