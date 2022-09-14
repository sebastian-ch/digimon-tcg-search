import { useEffect, useState } from 'react'

interface Results {
    image: string,
    rarity: string
}

const useFetchData = (input: string) => {
    const [data, setData] = useState<any>()
    const fetchData = async (input: string) => {
        const url = 'https://digimoncard.io/api-public/search.php?series=Digimon Card Game&n=';
        const response = await fetch(`${url}${input}`)
        const cards = await response.json();

        //console.log(cards);
        //const images = cards.map((card: any) => ({ image: card.image_url, rarity: card.cardrarity }))
        //console.log(cards);
        // console.log(images);
        setData(cards);
    }


    useEffect(() => {
        fetchData(input)
    }, [input])


    return data
}


export default useFetchData;