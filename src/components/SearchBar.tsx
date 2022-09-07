import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export default function BasicTextFields() {

    const [searchInput, setSearchInput] = useState<string>('');
    const [results, setResults] = useState<string[]>([])


    const fetchData = async (input: string) => {
        const url = 'https://digimoncard.io/api-public/search.php?series=Digimon Card Game&n=';
        const response = await fetch(`${url}${input}`)
        const cards = await response.json();

        const images = cards.map((x: any) => x.image_url)
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
                <TextField onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        handleEnter(e)
                    }
                }} id="outlined-basic" label="Outlined" variant="outlined" value={searchInput} onChange={handleChange} />
                <Button variant='contained' disabled={!searchInput} onClick={handleClick}>Search</Button>
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
                    results.map((x: string) => { return <img style={{ padding: '5px' }} alt='img' src={x} /> })
                }
            </Box>
        </Box>
    );
}