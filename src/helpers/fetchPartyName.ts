export async function fetchPartyName(partyId : string){
    const res = await fetch(`/api/parties/${partyId}`)
    const data = await res.json()
    return data.party.name;
}