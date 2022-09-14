import React, { CSSProperties, useState } from 'react';
import { alpha, styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import Button from '@mui/material/Button';

const CssTextField = styled(TextField)({
    '& label.Mui-focused': {
        color: 'green',
    },
    '& .MuiInput-underline:after': {
        borderBottomColor: 'green',
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'red',
        },
        '&:hover fieldset': {
            borderColor: 'yellow',
        },
        '&.Mui-focused fieldset': {
            borderColor: 'green',
        },
    },
});

interface Results {
    image: string,
    rarity: string

}

export default function BasicTextFields() {

    const [searchInput, setSearchInput] = useState<string>('');

    const [results, setResults] = useState<Results[]>([])

    const rareStyle: CSSProperties = {
        outline: 'none',
        border: '1px solid #4195fc',
        /* create a BIG glow */
        boxShadow: '0px 0px 14px #4195fc',
        height: '400px',
        padding: '15px'
    }

    const normalStyle: CSSProperties = {
        padding: '15px',
        height: '400px',
    }


    const rareImg = (rareCard: string) => {

        const style = {
            border: '1px red solid',

        }

        return <img src={rareCard} alt='rare' style={style} />
    }

    const fetchData = async (input: string) => {
        const url = 'https://digimoncard.io/api-public/search.php?series=Digimon Card Game&n=';
        const response = await fetch(`${url}${input}`)
        const cards = await response.json();

        console.log(cards);
        const images = cards.map((card: any) => ({ image: card.image_url, rarity: card.cardrarity }))
        //console.log(cards);
        // console.log(images);
        setResults(images);
        //return respon;
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        //console.log(event.target.value);
        setSearchInput(event.target.value);
    }

    const handleClick = (event: React.MouseEvent) => {
        event.preventDefault();
        fetchData(searchInput);
        //console.log(searchInput);
    }

    const handleEnter = (event: React.KeyboardEvent) => {
        event.preventDefault();
        console.log(event)
        fetchData(searchInput);
    }


    return (
        <Box>

            <Box
                component="form"
                sx={{
                    '& > :not(style)': { m: 1, width: '25ch' },
                    paddingBottom: '40px'
                }}
                noValidate
                autoComplete="off"
                display='flex'
                justifyContent='center'

            >
                <CssTextField
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault()
                            handleEnter(e)
                        }
                    }}
                    id="outlined-basic"
                    label="Enter a Digimon"
                    variant="outlined"
                    value={searchInput}
                    onChange={handleChange}
                    sx={{
                        input: {
                            color: 'blue'
                        }

                    }} />
                <Button variant='contained' color='success' disabled={!searchInput} onClick={handleClick}>Search</Button>
            </Box>
            <Box
                display='flex'
                width='100%'
                minHeight='70%'
                justifyContent='center'
                alignItems='center'
                flexWrap='wrap'
            >
                {
                    results.map((x: Results) => { return <img style={x.rarity == 'Rare' ? rareStyle : normalStyle} alt='img' src={x.image} /> })
                }
            </Box>
        </Box>
    );
}