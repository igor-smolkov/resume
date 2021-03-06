import './card.scss'

export default class Card {
    constructor(element, zone) {
        this.elementCard = element;
        this.elementCardFrontside = this.elementCard.querySelector('.card__frontside');
        this.elementCardBackside = this.elementCard.querySelector('.card__backside');

        this.elementCardZone = zone;
        this.elementCardZone.classList.add('card-zone');

        this.width = 600;
        this.height = 333;

        this.dragging = {
            cardElem: null,
            cursorShift: {x: null, y: null},
            isEnterZone: false,
            curDroppable: this.elementCardZone,
        }
        this.isTouch = false;

        this.isFlipping = false;

        this.elementCardFrontside.querySelectorAll('a[href="copy/"').forEach(elementContactToCopy => {
            elementContactToCopy.addEventListener('click', (e)=>{this.clickToCopy(e)});
        });

        this.renderFlipBtn();
        this.renderDragBtn();
        
        this.elementCard.addEventListener('pointerdown', (e)=>{this.onCardPointerDown(e)});
        this.elementCard.addEventListener('pointerup', this.onCardPointerUp.bind(this));
        this.elementCard.addEventListener('pointermove', (e)=>{this.onCardPointerMove(e)});

        document.addEventListener('pointermove', (e)=>{this.onDocPointerMove(e)});
        document.addEventListener('pointerup', this.onDocPointerUp.bind(this));

        this.elementCard.addEventListener('dragstart', (e)=>{this.onCardDragStart(e)});

        this.elementCardZone.addEventListener('dragenter', this.onCardZoneDragEnter.bind(this));
        this.elementCardZone.addEventListener('dragleave', this.onCardZoneDragLeave.bind(this));
        this.elementCardZone.addEventListener('dragover', (e)=>{this.onCardZoneDragOver(e)});
        this.elementCardZone.addEventListener('drop', (e)=>{this.onCardZoneDrop(e)});

        document.addEventListener('dragover', (e)=>{this.onDocDragOver(e)}, true);
        document.addEventListener('drop', (e)=>{this.onDocDrop(e)}, true);

        this.elementCard.addEventListener('wheel', (e)=>{this.onCardWheel(e)});

        window.addEventListener('resize', (e)=>this.onWinResize(e));

        this.refreshSizes();
    }

    renderFlipBtn() {
        for(let cardSide of [this.elementCardFrontside, this.elementCardBackside]) {
            const elemProps = new Map();
            elemProps.set('type', 'button');
            elemProps.set('title', 'Потяните, чтобы перевернуть визитку');
            tools.renderElem({
                parent: cardSide,
                tag: 'input',
                className: 'flip-field',
                props: elemProps,
            });
        }
    }
    renderDragBtn() {
        if (this.elementCard.querySelector('.drag-field')) return;
        for(let cardSide of [this.elementCardFrontside, this.elementCardBackside]) {
            const elemProps = new Map();
            elemProps.set('type', 'button');
            elemProps.set('title', 'Потяните, чтобы переместить визитку');
            tools.renderElem({
                parent: cardSide,
                tag: 'input',
                className: 'drag-field',
                props: elemProps,
            });
        }
    }
    delDragBtn() {
        this.elementCard.querySelectorAll('.drag-field').forEach(btnElem=>btnElem.remove());
    }

    onCardPointerDown(e) {
        this.animationAllRemove();
        this.isTouch = e.pointerType !== 'mouse' ? true : false;
        if (e.target.classList.contains('drag-field')) {
            this.setCardScale(1);
            this.dragReady(e);
        }
        if (e.target.classList.contains('flip-field') && !e.target.classList.contains('drag-field')) {
            this.flipStart(e.target);
        }
    }
    onCardPointerUp() {
        this.flipBack();
    }
    onCardPointerMove(e) {
        if (e.target.classList.contains('drag-field')) {
            this.setCardScale(1);
        }
    }
    onDocPointerMove(e) {
        this.flipEnd(e);
        if (this.isTouch) { 
            this.shiftCard(e);
            this.cardZoneOver(e);
        }
    }
    onDocPointerUp() {
        this.flipCancel();
        if (this.isTouch) { 
            this.drop();
        }
    }

    onCardWheel(e) {
        e.preventDefault();
        this.increaseCardScale(e.wheelDelta/1000);
    }
    initCardScale() {
        this.elementCard.style.transform = this.elementCard.style.transform ? this.elementCard.style.transform : 'scale(1)';
        return /\.*scale\((.*)\)/i;
    }
    getCardScale() {
        return +this.initCardScale().exec(this.elementCard.style.transform)[1];
    }
    setCardScale(value) {
        this.elementCard.style.transform = this.elementCard.style.transform.replace(this.initCardScale(), `scale(${Math.abs(value)}`);
    }
    increaseCardScale(delta) {
        const scale = this.getCardScale();
        this.elementCard.style.transform = this.elementCard.style.transform.replace(this.initCardScale(), `scale(${Math.abs(scale + delta)})`);
    }

    onWinResize(e) {
        this.refreshSizes()
    }
    refreshSizes() {
        const [winWidth, winHeight] = [document.documentElement.clientWidth, document.documentElement.clientHeight]
        if (winWidth <= 650) {
            this.delDragBtn();
            this.backInZone();
        } 
        if (winWidth > 650) {
            this.renderDragBtn();
        }
        if (this.elementCard.offsetWidth <= 450) {
            this.setCardFrontsideSmall();
        }
        if (this.elementCard.offsetWidth > 450) {
            this.resetCardFrontsideSmall();
        }
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

    animationAllRemove() {
        this.elementCard.classList.remove('card_animation_rotate-left');
        this.elementCard.classList.remove('card_animation_rotate-right');
        this.resetCardAnimationOpacity();
        this.resetCardAnimationScale();
    }
    setCardFrontsideSmall() {
        if (!this.elementCard.classList.contains('card__frontside_small')) {
            this.elementCard.classList.add('card__frontside_small');
        }
    }
    resetCardFrontsideSmall() {
        if (this.elementCard.classList.contains('card__frontside_small')) {
            this.elementCard.classList.remove('card__frontside_small');
        }
    }
    setCardDraggable() {
        this.elementCard.setAttribute('draggable', true);
    }
    resetCardDraggable() {
        this.elementCard.setAttribute('draggable', false);
    }
    setCardDragged() {
        this.elementCard.classList.add('card_dragged');
    }
    resetCardDragged() {
        this.elementCard.classList.remove('card_dragged');
    }
    setCardDragging() {
        this.elementCard.classList.add('card_dragging');
    }
    resetCardDragging() {
        this.elementCard.classList.remove('card_dragging');
    }
    setCardZoneAimed() {
        this.elementCardZone.classList.add('card-zone_aimed');
    }
    resetCardZoneAimed() {
        this.elementCardZone.classList.remove('card-zone_aimed');
    }
    setCardNone() {
        this.elementCard.classList.add('card_none');
    }
    resetCardNone() {
        this.elementCard.classList.remove('card_none');
    }
    setCardZoneAbandoned() {
        this.elementCardZone.classList.add('card-zone_abandoned');
    }
    resetCardZoneAbandoned() {
        this.elementCardZone.classList.remove('card-zone_abandoned');
    }
    setCardAnimationOpacity() {
        this.elementCard.classList.add('card_animation_opacity');
    }
    resetCardAnimationOpacity() {
        this.elementCard.classList.remove('card_animation_opacity');
    }
    setCardAnimationScale() {
        this.elementCard.classList.add('card_animation_scale');
    }
    resetCardAnimationScale() {
        this.elementCard.classList.remove('card_animation_scale');
    }
    toggleFrontAndBacksideNone() {
        this.elementCardFrontside.classList.toggle('card__frontside_none');
        this.elementCardBackside.classList.toggle('card__backside_none');
    }
    backInZone() {
        this.elementCard.style.left = 'auto';
        this.elementCard.style.top = 'auto';
        this.resetCardDragged();
        this.resetCardZoneAbandoned();
    }

    //Drag&Drop
    dragReady(e) {
        if (this.dragging.cardElem === null) {
            this.dragging.cardElem = this.elementCard;
            if (!this.isTouch) {
                this.setCardDraggable();
                console.log('no-touch');
            } else {
                this.setCardDragged();
                this.setCardDragging();
                this.cardDragStart(e);
                this.shiftCard(e);
                this.setCardZoneAbandoned();
            }
        }
    }
    onCardDragStart(e) {
        if (this.dragging.cardElem === null) return;
        this.cardDragStart(e)
    }
    cardDragStart(e) {
        this.dragging.isEnterZone = false;
        this.dragging.cursorShift.x = e.clientX - this.dragging.cardElem.offsetLeft + (this.width - this.dragging.cardElem.offsetWidth);
        this.dragging.cursorShift.y = e.clientY - this.dragging.cardElem.offsetTop + (this.height - this.dragging.cardElem.offsetHeight);
    }
    onCardZoneDragEnter() {
        if (this.dragging.cardElem === null) return;
        this.dragging.isEnterZone = true;
        this.setCardZoneAimed();
    }
    onCardZoneDragLeave() {
        if (this.dragging.cardElem === null) return;
        this.dragging.isEnterZone = false;
        this.resetCardZoneAimed();
    }
    onCardZoneDragOver(e) {
        this.dragOver(e, true)
    }
    onDocDragOver(e) {
        this.dragOver(e, false)
    }
    dragOver(e, zone) {
        if (this.dragging.cardElem === null) return;
        e.preventDefault();
        window.getSelection().removeAllRanges();
        if (zone) {
            this.dragging.isEnterZone = true;
            this.setCardZoneAimed();
        } else {
            this.setCardNone();
            this.setCardZoneAbandoned();
        }
    }
    onCardZoneDrop(e) {
        this.dragging.isEnterZone = true;
        this.drop(e)      
    }
    onDocDrop(e) {
        this.drop(e)
    }
    drop(e) {
        if (this.dragging.cardElem === null) return;
        if (!this.isTouch) {
            this.resetCardNone();
            if (!this.dragging.isEnterZone) {
                this.setCardDragged();
                this.shiftCard(e);
            } else {
                this.backInZone();
            }
            this.resetCardDraggable();
        } else {
            this.resetCardDragging();
            if (this.dragging.isEnterZone) {
                this.backInZone();
            }
        }
        this.setCardAnimationOpacity();
        this.resetCardZoneAimed();
        this.dragging.cardElem = null;
        this.dragging.cursorShift.x = null;
        this.dragging.cursorShift.y = null;
    }
    shiftCard(e) {
        if (this.dragging.cardElem === null) return;
        this.dragging.cardElem.style.left = e.clientX - this.dragging.cursorShift.x + 'px';
        this.dragging.cardElem.style.top = e.clientY - this.dragging.cursorShift.y + 'px';
    }
    cardZoneOver(e) {
        if (this.dragging.cardElem === null) return;
        this.setCardNone();
        let elemBelow = document.elementFromPoint(e.clientX, e.clientY);
        this.resetCardNone();
        if (!elemBelow) return;
        if (elemBelow.closest('.card-zone') === this.elementCardZone) {
            this.dragging.isEnterZone = true;
            this.setCardZoneAimed();
        } else {
            this.dragging.isEnterZone = false;
            this.resetCardZoneAimed();
        }
    }

    //Card flip
    flipStart() {
        this.toggleFrontAndBacksideNone();
        this.isFlipping = true;
    }
    flipEnd(e) {
        if (this.isFlipping && (!e.target.classList.contains('flip-field') || e.pointerType !== 'mouse')) {
            this.setCardAnimationScale();
            this.flipCancel();
        }
    }
    flipBack() {
        if (this.isFlipping) {
            this.toggleFrontAndBacksideNone();
            this.flipCancel();
        }
    }
    flipCancel() {
        this.isFlipping = false;
    }
}

const tools = {
    renderElem: ({ parent = document, tag = 'div', className = '', props = false}) => {
        const elem = document.createElement(tag);
        elem.className = className;
        if (props) {
            for (let prop of props) {
                elem[prop[0]] = prop[1];
            }
        }
        parent.append(elem);
    }
};