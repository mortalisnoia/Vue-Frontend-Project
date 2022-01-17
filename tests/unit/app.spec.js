import { mount } from '@vue/test-utils'
import app from '@/App.vue'
import axios from 'axios';

//Apenas declarando variáveis que vou usar nos testes, pra não precisar escrever tudo e deixar a leitura confusa
const salaryField = '#salario';
const discounts = '#descontos';
const calculateButton = '#calcular';
const mensagem = '#mensagem';
let validSalary = 5000;
let validDiscount = 200;

//Para mockar o axios, usamos isso
jest.mock("axios");

//Montagem do componente, melhor separar em uma função pois será usado em todos os casos de teste
function factory() {
    return mount(app);
}

describe('Testes da tela de calcular salário', () => {

    //Roda antes de cada execução de caso de teste
    //Resetamos todos os mocks para um caso de teste não ter interferência em outro
    //Não fazer isso pode acarretar em erros na asserção de 'toBeCalledTimes()', pois a contagem nunca zerará
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Checando se algum elemento está presente no HTML do componente', () => {
        const wrapper = factory();

        //Checando se no html do componente montado existe uma div com id = app
        expect(wrapper.html()).toContain('<div id=\"app\">');
    })

    it('Estado inicial do componente deve conter o mesmo data do componente', () => {
        const wrapper = factory();

        //Para pegarmos valores de campos na jsdom temos que acessar o .vm do wrapper.
        //Se tentarmos pegar o valor direto, ele sempre retornará o valor padrão mesmo depois de modificado, que nesse caso é vazio
        //Como não houve interação e a montagem foi padrão, os campos devem ter o mesmo valor do data do componente
        expect(wrapper.vm.$data.calculateForm.salario).toBe('');
        expect(wrapper.vm.$data.calculateForm.descontos).toBe('');
        expect(wrapper.vm.$data.calculateForm.salarioLiquido).toBe('0,00');
        expect(wrapper.vm.$data.calculateForm.mensagem).toBe('Seu salário líquido é de R$');
        expect(wrapper.find(calculateButton).text()).toBe('Calcular Salário Líquido');
    })

    it('checando se os valores de fato foram preenchidos na tela do componente', async () => {
        const wrapper = factory();

        //Escrevendo nos campos do form. É preciso usar o "await" para que os expects não sejam executados no mesmo Frame, quando o campo ainda estava vazio
        await wrapper.find(salaryField).setValue(validSalary);
        await wrapper.find(discounts).setValue(validDiscount);

        //Verificando se os campos estão com os valores preenchidos anteriormente.
        expect(wrapper.find(salaryField).element.value).toBe(validSalary.toString());
        expect(wrapper.find(discounts).element.value).toBe(validDiscount.toString());
    })

    it('Setando o data do componente sem interagir diretamente com a página', async () => {
        const wrapper = factory();

        //Setando os valores no data do componente diretamente, sem precisar preencher os campos na jsdom
        //Isso pode ser chamado no mount, mas como separamos em uma função externa, fazemos isso aqui
        //Usamos o await sempre que formos interagir com o componente, caso contrário a próxima instrução executará antes do próximo frame e o teste falhará
        await wrapper.setData({ 
            calculateForm: {
              salario: validSalary
            }
          });

        //Verificando se o valor do campo foi atualizado com o valor do atributo no data. Usamos o toString() pq senão irá comparar número com String
        expect(wrapper.find(salaryField).element.value).toBe(validSalary.toString());
    })

    it('Testando propriedades inline do elemento, botão calcular deve estar disabled se salario.length < 3', async () => {
        //O campo está vazio na montagem padrão, logo tem que estar disabled
        const wrapper = factory();

        //com o .element ou .attributes conseguimos acessar propriedades inline do elemento. Somente inline.
        expect(wrapper.get(calculateButton).element.disabled).toBe(true);

        //Inserindo um número com length >= 3 para habilitar o botão de calcular
        await wrapper.find(salaryField).setValue('123');

        //Checando novamente a propriedade, que agora deve ser false
        expect(wrapper.find(calculateButton).element.disabled).toBe(false);
    })

    it('Usando o spy e checando quantas vezes uma função foi chamada', async () => {
        //Cria e retorna uma função mock. Semelhante ao jest.fn mas o spyOn consegue rastrear chamadas à função
        //Passamos como parâmetro do jest.spyOn a localização da função lá no componente e também o nome dela
        const calcularFunction = jest.spyOn(app.methods, 'calcular');
        
        //Devemos montar o componente somente depois de criar a função mockada, pq essa que será chamada.
        //Caso não façamos isso, o retorno para o número de chamadas sempre será zero
        const wrapper = factory();

        //Preenchi um valor somente para o botão ficar habilitado
        await wrapper.find(salaryField).setValue(validSalary);
        
        //Dou um trigger para disparar a função, pois é o type do meu botão
        await wrapper.get(calculateButton).trigger('submit');
        
        //Aqui verificamos quantas vezes a função foi chamada. Como disparamos o botão apenas 1x, então a função deve ter sido chamada 1x
        expect(calcularFunction).toBeCalledTimes(1);
    })


    //mockando a função de post do axios
    const mockReturn = 1000;
    jest.mock('axios', () => ({
        post: jest.fn(() => mockReturn)
    }))
    //Como não tenho backend, esse teste precisa de um mock para poder fazer a request
    it('Checando a informação que o serviço mandou para o backend', async () => {
        //Novamente eu monto o componente, preencho o campo required e dou um submit para chamar a função
        const wrapper = factory();
        await wrapper.get(salaryField).setValue(validSalary);
        await wrapper.get(calculateButton).trigger('submit');
        
        //Verifico se o mock da minha request foi chamado o número correto de vezes
        expect(axios.post).toHaveBeenCalledTimes(1);

        //Aqui eu verifico se o mock enviou as informações corretas necessárias para o backend
        expect(axios.post).toHaveBeenCalledWith("http://localhost:3000", {"grossSalary": "5000", "otherDiscounts": ""}, 
            {"headers": {"Content-Type": "application/json"}});
    })


    
    it('Testando o retorno da função, mockando o retorno da API', async () => {
        //Espiando o método "calcular"
        const mockCalcular = jest.spyOn(app.methods, 'calcular');
        const wrapper = factory();

        //A parte chave do teste. Aqui eu digo que sempre que eu tentar fazer um post pelo axios, quero receber essa resposta, simulando um backend
        axios.post.mockResolvedValue({data: 1001});

        //Preencho os campos para habilitar o botão
        await wrapper.find(salaryField).setValue(validSalary);
        //Disparo o submit no form, fazendo com que o axios tente mandar um post para a API
        await wrapper.find(calculateButton).trigger('submit');

        //Verifico se a função calcular foi de fato chamada 1x
        expect(mockCalcular).toHaveBeenCalledTimes(1);

        //Verifico se o retorno mockado foi de fato escrito na tela
        expect(wrapper.find(mensagem).text()).toBe(wrapper.vm.$data.calculateForm.resposta);
    
    })

    //Com esse carinha podemos simular o tempo
    jest.useFakeTimers();
    it('Resposta deve sumir após 5 segundos, usando FakeTimers()', async () => {
        //Novamente monto o componente
        const wrapper = factory();

        //Como preciso de um valor na tela, novamente mocko o retorno da API
        axios.post.mockResolvedValue({data: 1001});

        //Preencho o campo de salário e dou um submit no form
        await wrapper.find(salaryField).setValue(validSalary);
        await wrapper.find(calculateButton).trigger('submit');

        //Verifico se a resposta foi escrita na tela
        expect(wrapper.find(mensagem).text()).toBe(wrapper.vm.$data.calculateForm.resposta);

        //Passo 1 segundo, usando o FakeTimers()
        await jest.advanceTimersByTime(1000);

        //Verifico se a propriedade ainda está visível. Deve sumir somente após 5 segundos
        expect(wrapper.vm.$data.calculateForm.elementVisible).toBe(true);

        //Passo mais 5 segundos
        await jest.advanceTimersByTime(5000);

        //Agora após 6 segundos, a propriedade não deve mais estar visível. Checo se ela está "false"
        expect(wrapper.vm.$data.calculateForm.elementVisible).toBe(false);
    })
  
})