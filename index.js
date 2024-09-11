const { select, input, checkbox } = require('@inquirer/prompts')
const fs = require("fs").promises // do node para salvar as metas cadastradas BD

let mensagem = "Bem vindo ao App de Metas!";
let metas

const carregarMetas = async () => {
  try {
    const dados = await fs.readFile("metas.json", "utf-8")
    metas = JSON.parse(dados)
  }
  catch(erro) {
    metas = []
  }
}

const salvarMetas = async () => {
  await fs.writeFile("metas.json", JSON.stringify(metas, null, 2))
}

const cadastrarMeta = async () => {
  const meta = await input({ message: "Digite a meta" })

  if (meta.length == 0) {
    mensagem = 'A meta não pode ser vazia.'
    return
  }

  metas.push({ value: meta, checked: false }) // empurrar para o array

  mensagem = "Meta cadastrada com sucesso!"

}

const listarMetas = async () => {
  if(metas.length == 0) {
    mensagem = "Não existem metas!"
    return
  }

  const respostas = await checkbox({ // marca e salva em respostas
    message: "Use as Setas para mudar de meta, o Espaço para marcar ou desmarcar e o Enter para finalizar",
    choices: [...metas],
    instructions: false
  })

  metas.forEach((m) => {
    m.checked = false // desmarca todas as metas do array
  })

  if (respostas.length == 0) {
    mensagem = "Nenhuma meta selecionada"
    return
  }

  respostas.forEach((resposta) => {
    const meta = metas.find((m) => {
      return m.value == resposta // marca só as que baterem, forem iguais
    })

    meta.checked = true // mostra as marcadas
  })

  mensagem = 'Meta(s) marcada(s) como concluída(s)'
}

const metasRealizadas = async () => {
  if(metas.length == 0) {
    mensagem = "Não existem metas!"
    return
  }

  const realizadas = metas.filter((meta) => {
    return meta.checked
  })

  if (realizadas.length == 0) {
    mensagem = "Não existem metas realizadas!"
    return
  }

  await select({
    message: "Metas Realizadas: " + realizadas.length,
    choices: [...realizadas]
  })
}

const metasAbertas = async () => { // não realizadas
  if(metas.length == 0) {
    mensagem = "Não existem metas!"
    return
  }

  const abertas = metas.filter((meta) => {
    return meta.checked != true // é diferente de realizada(true)? = true, ent entra no filtro
  })

  if (abertas.length == 0) {
    mensagem = "Não existem metas abertas"
    return
  }

  await select({
    message: "Metas Abertas: " + abertas.length,
    choices: [...abertas]
  })
}

const deletarMetas = async () => {
  if(metas.length == 0) {
    mensagem = "Não existem metas!"
    return
  }
  
  const metasDesmarcadas = metas.map((meta) => {
    return {value: meta.value, checked: false} //retorna todas c não checked
  })

  const itensADeletar = await checkbox({ 
    message: "Selecione item para deletar",
    choices: [...metasDesmarcadas],
    instructions: false,
  })

  if(itensADeletar == 0) {
    mensagem = "Nenhum item para deletar"
    return
  }

  itensADeletar.forEach((item) => {
    metas = metas.filter((meta) => { 
      // só entra no filter(em metas) o q for true
      return meta.value != item
      // se "item marcado"(false) != "meta"(true) -> true
      // ent entra no filter e fica no array metas
      // se (true != true -> false) n entra no filter e sai do array metas
    })
  })

  mensagem = "Meta(s) deletada(s) com sucesso!"
}

const mostrarMensagem = () => {
  console.clear()

  if(mensagem != "") {
    console.log(mensagem)
    console.log("")
    mensagem = ""
  }
}

const start = async () => {
  await carregarMetas()

  while (true) {
    mostrarMensagem()
    await salvarMetas()

    const option = await select({
      message: "Menu >",
      choices: [
        {
          name: "Cadastrar meta",
          value: "cadastrar"
        },
        {
          name: "Listar metas",
          value: "listar"
        },
        {
          name: "Metas realizadas",
          value: "realizadas"
        },
        {
          name: "Metas abertas",
          value: "abertas"
        },
        {
          name: "Deletar metas",
          value: "deletar"
        },
        {
          name: "Sair",
          value: "sair"
        }
      ]
    })

    switch (option) {
      case "cadastrar":
        await cadastrarMeta()
        break
      case "listar":
        await listarMetas()
        break
      case "realizadas":
        await metasRealizadas()
        break
      case "abertas":
        await metasAbertas()
        break
      case "deletar":
        await deletarMetas()
        break
      case "sair":
        console.log("Até a próxima!")
        return
    }
  }
}

start()