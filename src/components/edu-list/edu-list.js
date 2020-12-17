import './edu-list.scss'

const importantStack = ['HTML', 'CSS', 'JavaScript', 'React', 'Git', 'SCSS', 'jQuery', 'JSON', 'Pug', 'Jest', 'npm', 'VSCode', 'JSX', 'AJAX'];
const usefulStack = ['XML', 'UML', 'PHP', 'MySQL', 'C#'];

export default function() {
    const stacks = document.querySelectorAll('.stack-list')
    stacks.forEach(stack => {
        const techs = stack.querySelectorAll('.stack-list__tech')
        techs.forEach(tech => {
            if(importantStack.find(e => e === tech.innerText)) {
                tech.classList.add('stack-list__tech_important')
            }
            if(usefulStack.find(e => e === tech.innerText)) {
                tech.classList.add('stack-list__tech_useful')
            }
        })
    })
}