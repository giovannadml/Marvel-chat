import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React from 'react';
import appConfig from '../config.json';
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/router';
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';

const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzMyNTg2MiwiZXhwIjoxOTU4OTAxODYyfQ.QWcuC-Oo6w-MhxPDH2kj4IKl3CNQLFU0xyRrgHR5Y8M";
const SUPABASE_URL = "https://zfqsduzbstuvfyiixmqh.supabase.co";
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function escutaMensagensEmTempoReal(adicionaMensagem) {
  return supabaseClient
    .from('mensagens')
    .on('INSERT', (respostaLive) => {
      adicionaMensagem(respostaLive.new)
    })
    .subscribe();
}

export default function ChatPage() {
  const roteamento = useRouter();
  const username = roteamento.query.username;
  const [mensagem, setMensagem] = React.useState('');
  const [listagem, setListagem] = React.useState([
    // {
    //   id: 1,
    //   de: 'omariosouto',
    //   texto: ':sticker: https://c.tenor.com/TKpmh4WFEsAAAAAC/alura-gaveta-filmes.gif',
    //   horario: '19:29:26',
    // },
    // {
    //   id: 2,
    //   de: 'peas',
    //   texto: 'uuuuuuu',
    //   horario: '19:31:51',
    // }
  ]);
  
  React.useEffect(() => {
    supabaseClient
      .from('mensagens')
      .select('*')
      .order('id', { ascending: false })
      .then(({ data }) => {
        // console.log('Dados da consulta: ', data);
        setListagem(data);
      });

      escutaMensagensEmTempoReal((novaMensagem) => {
        setListagem((valorAtualDaLista) => {
          return [
            novaMensagem,
            ...valorAtualDaLista,
          ]
        });
      });
  }, []);

  function handleNovaMensagem(novaMensagem) {
    const mensagem = {
      // id: listagem.length + 1,
      de: username,
      texto: novaMensagem,
      horario: new Date().toLocaleTimeString(),
    };

    supabaseClient
      .from('mensagens')
      .insert([
        mensagem
      ])
      .then(({ data }) => {
        // console.log('Criando mensagem: ' + data);
      });

    setMensagem('');
  }

  return (
    <Box
      styleSheet={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        backgroundColor: appConfig.theme.colors.neutrals[300],
        backgroundImage: 'url(https://virtualbackgrounds.site/wp-content/uploads/2020/07/doctor-stranges-window-of-the-worlds-1536x864.jpg)',
        backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
        color: appConfig.theme.colors.neutrals['000']
      }}
    >
      <Box
        styleSheet={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
          borderRadius: '5px',
          backgroundColor: appConfig.theme.colors.neutrals[700],
          height: '100%',
          maxWidth: '95%',
          maxHeight: '95vh',
          padding: '32px',
        }}
      >
        <Header />
        <Box
          styleSheet={{
            position: 'relative',
            display: 'flex',
            flex: 1,
            height: '80%',
            backgroundColor: appConfig.theme.colors.neutrals[600],
            flexDirection: 'column',
            borderRadius: '5px',
            padding: '16px',
          }}
        >

          <MessageList mensagens={listagem} />
          {/* {listagem.map((mensagemAtual) => {
            return (
              <li key={mensagemAtual.id}>
                {mensagemAtual.de}: {mensagemAtual.texto}
              </li>
            )
          })} */}

          <Box
            as="form"
            styleSheet={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TextField
              value={mensagem}
              onChange={(event) => {
                const valor = event.target.value;
                setMensagem(valor);
              }}
              onKeyPress={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  handleNovaMensagem(mensagem);
                }
              }}
              placeholder="Insira sua mensagem aqui..."
              type="textarea"
              styleSheet={{
                width: '100%',
                border: '0',
                resize: 'none',
                borderRadius: '5px',
                padding: '6px 8px',
                backgroundColor: appConfig.theme.colors.neutrals[800],
                marginRight: '12px',
                color: appConfig.theme.colors.neutrals[200],
              }}
            />
            {/* CallBack */}
            <ButtonSendSticker
              onStickerClick={(sticker) => {
                console.log('[USANDO O COMPONENTE] Salva esse sticker no banco', sticker);
                handleNovaMensagem(':sticker: ' + sticker)
              }}
            />
            <Button
              variant='secondary'
              styleSheet={{
                display: 'flex',
                alignItems: 'center',
                minWidth: '80px',
                justifyContent: 'center',
                padding: '0 8px',
                minHeight: '50px',
                marginLeft: '5px',
                marginBottom: '8px',
                lineHeight: '0',
              }}
              label='Enviar'
              buttonColors={{
                contrastColor: appConfig.theme.colors.neutrals["000"],
                mainColor: appConfig.theme.colors.primary[500],
                mainColorStrong: appConfig.theme.colors.primary[600],
              }}
              onClick={() => handleNovaMensagem(mensagem)}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function Header() {
  return (
    <>
      <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
        <Text variant='heading4'>
          Chat
        </Text>
        <Button
          variant='tertiary'
          buttonColors={{
            contrastColor: appConfig.theme.colors.neutrals["000"],
            mainColor: appConfig.theme.colors.primary[500],
            mainColorLight: appConfig.theme.colors.neutrals[400],
          }}
          label='Logout'
          href="/"
        />
      </Box>
    </>
  )
}

function MessageList(props) {

  function handleExcluirMensagem(id){
    console.log(id);
    // props.mensagens.filter(m => m.id != id);
    // props.mensagens.splice(mensagem.indexOf(), 1);
    // console.log(props.mensagens.indexOf(mensagem));
  }

  return (
    <Box
      tag="ul"
      styleSheet={{
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column-reverse',
        flex: 1,
        color: appConfig.theme.colors.neutrals["000"],
        marginBottom: '16px',
      }}
    >
      {props.mensagens.map((mensagem) => {
        return (
          <Text
            key={mensagem.id}
            tag="li"
            styleSheet={{
              borderRadius: '5px',
              padding: '6px',
              marginBottom: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              hover: {
                backgroundColor: appConfig.theme.colors.neutrals[700],
              }
            }}
          >
            <Box 
              styleSheet={{
                justifyContent: 'space-between'
              }}
            >
              <Box
                styleSheet={{
                  marginBottom: '8px',
                }}
                
              >
                <Image
                  styleSheet={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'inline-block',
                    marginRight: '8px'
                  }}
                  src={`https://github.com/${mensagem.de}.png`}
                />
                <Text tag="strong">
                  {mensagem.de}
                </Text>
                <Text
                  styleSheet={{
                    fontSize: '10px',
                    marginLeft: '8px',
                    color: appConfig.theme.colors.neutrals[300],
                  }}
                  tag="span"
                >
                  {(new Date().toLocaleDateString())} às {mensagem.horario}
                </Text>
              </Box>
              {mensagem.texto.startsWith(':sticker:')
                ? (
                  <Image src={mensagem.texto.replace(':sticker:', '')} />
                )
                : (
                  mensagem.texto
                )
              }
            </Box>
            <Button
              iconName={'trash'}
              variant='tertiary'
              colorVariant='negative'
              onClick={() => handleExcluirMensagem(mensagem.id)}
            />
          </Text>
        );
      })}
    </Box>
  )
}