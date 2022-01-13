import { mount, shallowmount } from '@vue/test-utils'
import app from '@/App.vue'

const salaryField = '#salario';
const discounts = '#descontos';
const calculateButton = '#calcular';
let validSalary = 333;

//Montagem do componente, melhor separar em uma função pois será usado em todos os casos de teste
function factory() {
    return mount(app);
}

describe('Testes da tela de calcular salário', () => {

    //Roda antes de cada execução de caso de teste
    //Resetamos todos os mocks para um caso de teste não ter interferência em outro
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it('Checando se algum elemento está presente no HTML do componente', () => {
        const wrapper = factory();

        expect(wrapper.html()).toContain('<div id=\"app\">');
    })

    it('Estado inicial do componente deve conter o mesmo data do componente', () => {
        const wrapper = factory();

        expect(wrapper.vm.$data.calculateForm.salario).toBe('');
        expect(wrapper.vm.$data.calculateForm.descontos).toBe('');
        expect(wrapper.vm.$data.calculateForm.salarioLiquido).toBe('');
        expect(wrapper.vm.$data.calculateForm.mensagem).toBe('Seu salário líquido é de R$');
        expect(wrapper.find(calculateButton).element.disabled).toBe(true);
    })

    it.only('Setando o data do componente sem interagir com a página', async () => {
        const wrapper = factory();

        await wrapper.setData({ 
            calculateForm: {
              salario: validSalary,
            }
          });

        expect(wrapper.find(salaryField).element.value).toBe(validSalary.toString());
    })

    it('Se habilitado, o botão Calcular deve chamar a função calcular() 1x ao ser clicado', async () => {
        const calcularFunction = jest.spyOn(app.methods, 'calcular');
        
        const wrapper = factory();

        await wrapper.get(salaryField).setValue(validSalary);

        await wrapper.get(calculateButton).trigger('submit');

        expect(calcularFunction).toBeCalledTimes(1);
    })

    
})