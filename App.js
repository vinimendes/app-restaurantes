import { StatusBar } from 'expo-status-bar';
import React, { useState, useReducer, createContext, useContext} from 'react';
import { StyleSheet, Text, View, TextInput, Button, FlatList } from 'react-native';
import { object, string, number } from 'yup';
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Entypo as Icon } from '@expo/vector-icons';

import axios from 'axios';

const estadoInicio = {
  lista: []
}

const contextoIncial = {
  id: "", setId: ( valor ) => {},
  nome: "", setNome: ( valor ) => {},
  tipo: "", setTipo: ( valor ) => {},
  classificacao: "", setClassificacao: ( valor ) => {},
  estado: {}, dispatcher: ( action ) => {},
  salvar: () => {},
  apagar: ( valor ) => {}
}

const Contexto = createContext ( contextoIncial );

const funcaoReducer = (estado, {type, payload}) => {
  if (type === "LISTA_LIMPAR") {
    return { lista : [] }
  } if (type === "LISTA_ADICIONAR") {
    return { lista: [ ... estado.lista, payload ] }
  }
  throw new Exception("Tipo invalido na funcaoReducer");
}

const { Screen, Navigator } = createBottomTabNavigator();

// Schema
const RestauranteSchema = object({
  nome: string().required().min(3),
  tipo: string().required(),
  classificacao: number().required().min(0)
})

const persistenciaRestAPI = () => {

  const api = axios.create({

    baseURL: "https://fiap-restaurantes-c5c28-default-rtdb.firebaseio.com"

  })

  const salvarAPI = ( obj ) => {
    return api.post("/restaurantes.json", obj);
  }

  const apagarAPI = ( obj ) => {
    return api.delete(`/restaurantes/${obj.id}.json`)
  }

  const carregarAPI = () => {
    return api.get("/restaurantes.json")
  }

  return {
    salvarAPI,
    apagarAPI
  }
}

  const useRestauranteControl = () => {

    const [id, setId] = useState(null);
    const [nome, setNome] = useState("");
    const [tipo, setTipo] = useState("");
    const [classificacao, setClassificacao] = useState("");
    const [estado, dispatcher] = useReducer(funcaoReducer, estadoInicio);

    const persistencia = persistenciaRestAPI();


    const salvar = () => {
      const obj = {nome, tipo, classificacao}
      persistencia.salvarAPI(obj)
      .then( () => { alert("Resturante salvo com sucesso") } );
    }

    const apagar = ( obj ) => {
      persistencia.apagarAPI(obj)
      .then( () => {
        carregar();
      } );
    }

    const carregar = () => {

    }

    return (
      id, setId,
      nome, setNome,
      tipo, setTipo,
      classificacao, setClassificacao,
      estado, dispatcher,
      salvar,
      apagar

    )

  }

const Formulario = () => {

  const control = useContext(Contexto)

  const nomeBotao = control.id ? "Salvar" : "Cadastrar";

  return (
    <View>
      <TextInput placeholder="Nome do Restaurante" value={control.nome} onChangeText={control.setNome} />
      <TextInput placeholder="Tipo da comida" value={control.tipo} onChangeText={control.setTipo} />
      <TextInput placeholder="Classificacao" value={control.classificacao} onChangeText={control.setClassificacao} />
      <Button title={nomeBotao} />
    </View>
  )

}

const Item = (props) => {

  return(
    <View key={props.index} >
      <Text>Nome do restaurante: {props.item.nome}</Text>
      <Text>Tipo: {props.item.tipo}</Text>
      <Text>Classificacao: {props.item.classificacao}</Text>
      <Icon name="trash" size={28} onPress={props.apagar}/>
    </View>
  )
}

const Listagem = () => {
  
  const control = useContext(Contexto);

  return(
    <View style={{flex: 1}} >
      <FlatList data={control.estado.lista} renderItem={ (propsItem) => <Item {... propsItem} apagar={control.apagar} /> } />
    </View>
  )
}

export default function App() {

  const control = useRestauranteControl();

  return (
    <Contexto.Provider value={control} >

      <NavigationContainer>

        <View style={{flex: 1}}>
          <Text>App Restaurantes</Text>
          <StatusBar style="auto" />

          <View style={{flex: 1}}>

            <Navigator>
              <Screen name="Cadastro" component={Formulario} />
              <Screen name="Listagem" component={Listagem} />
              {/* <Screen name="Mapa" /> */}
            </Navigator>
          </View>

        </View>

      </NavigationContainer>

    </Contexto.Provider>
  );
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
