<template>
  <div id="app">
    <p><img src="@/assets/brainny.png"
      contain
      height="250px"
      width="500px"
      ></p>
    <h2 class="font-bold text-xl">
        Calcule seu salário líquido
    </h2>
    <form @submit.prevent="calcular"> 
      <div class="mb-5">
          <label
            class="block text-gray-700 text-sm font-bold mb-2"
            for="salario"
          >
            Salário bruto em R$ <span class="text-red-500"></span>
          </label>
          <input
            id="salario"
            v-model="calculateForm.salario"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-green-200"
            type="number"
            tabindex="3"
            placeholder="Ex: 5000.00"
            required
          >
      </div>
      <div class="mb-5">
          <label
            class="block text-gray-700 text-sm font-bold mb-2"
            for="descontos"
          >
            Outros descontos <span class="text-red-500"></span>
          </label>
          <input
            id="descontos"
            v-model="calculateForm.descontos"
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring focus:ring-green-200"
            type="number"
            tabindex="2"
            placeholder="Ex: 200.00"            
          >
      </div>
      <button v-bind:disabled="calculateForm.salario.length < 3  ? true : false"
            id='calcular'
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring focus:ring-green-200"
            type="submit"
            tabindex="3"
          >
            Calcular Salário Líquido
      </button>
    </form>
    <h3 v-show='calculateForm.elementVisible' class='hideElement' id="mensagem">{{ calculateForm.resposta }}</h3>
  </div>
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'

export default {
  data: () => ({
    calculateForm: {
      salario: '',
      descontos: '',
      salarioLiquido: '0,00',
      mensagem: 'Seu salário líquido é de R$',
      resposta: '',
      elementVisible: true
    }
  }),
  methods: {
    async calcular () {
      try {
        const axios = require('axios');
        const response = await axios.post('http://localhost:3000', {
          grossSalary: this.calculateForm.salario,
          otherDiscounts: this.calculateForm.descontos
        },  
        {headers: {
          'Content-Type': 'application/json',
        }})
        this.calculateForm.salarioLiquido = response.data;
        this.calculateForm.resposta = this.calculateForm.mensagem + this.formatPrice(this.calculateForm.salarioLiquido);
        this.calculateForm.elementVisible = true;
        setTimeout(() => this.calculateForm.elementVisible = false, 5000)
      }
      catch {
        //
      }
      
    },
    
    formatPrice(value) {
      let val = (value/1).toFixed(2).replace('.', ',')
      val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
      return parseInt(val, 10);
    }
  }
  //name: 'App',
  //components: {
    //HelloWorld
  //}
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
  margin-left:650px;
  display: inline-block;
  font-size: 20px;
}
input[type=number], :focus {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 15px;
  background-color: whitesmoke;

}

button[type=submit] {
  width: 100%;
  background-color: #4CAF50;
  color: white;
  padding: 14px 20px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
}

button[type=submit]:disabled {
  width: 100%;
  background-color: grey;
  color: white;
  padding: 14px 20px;
  margin: 8px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
}
</style>
