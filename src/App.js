import './App.css';

import React,{useState,useEffect} from 'react';
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent
} from '@material-ui/core';
import Map from './Components/Map';
import Table from './Components/Table';
import InfoBox from './Components/InfoBox';
import {sortData,prettyPrintStat} from './utils/util';
import LineGraph from './Components/LineGraph'
import "leaflet/dist/leaflet.css";

function App() {

  const [countries,setCountries] = useState([]); //array of object having country name and country code for all the countries
  const [country,setCountry] = useState('worldwide'); //the state which will contain the selected country name
  const [countryInfo,setCountryInfo] = useState({}); //object which will store the country case details, fetched from api
  const [tableData,setTableData] = useState([]); // contain the sorted data of total Covid cases for each country which will be getting rendered on table
  const [mapCenter,setMapCenter]=useState({lat:34.80746,lng:-40.4796});//object having latitude and longitude value of selected country
  const [mapZoom,setMapZoom]=useState(3);//used to Zoom in and Zoom out the map
  const [mapCountries,setMapCountries]=useState([]);//array having the list of countries will be present in our map
  const [casesType,setCasesType]=useState('cases');
  

  useEffect(()=>{
    fetch('https:/disease.sh/v3/covid-19/all').then((response)=>response.json()).then((data)=>{
      setCountryInfo(data);
    });
  },[]);

  useEffect(()=>{
    const getCountriesData = async()=>{
      await fetch('https:/disease.sh/v3/covid-19/countries').then((response)=>response.json()).then((data)=>{
        const countries = data.map((country)=>(
        {
          name : country.country,value:country.countryInfo.iso2
        }
      ));
      const sortedData = sortData(data)
      setTableData(sortedData)
      setMapCountries(data)
      setCountries(countries)
      })
    }
    getCountriesData(); 
  },[]);

  const onCountryChange = async(event)=>{
    const countryCode = event.target.value;
    
    setCountry(countryCode)
    const url = countryCode==='worldwide'?'https://disease.sh/v3/covid-19/all':`https://disease.sh/v3/covid-19/countries/${countryCode}`;
   
    await fetch(url).then((response)=>response.json()).then(data=>{
      setCountry(countryCode);
      setCountryInfo(data);

      var mmapCenter = countryCode==='worldwide'? {lat:34.80746,lng:-40.4796}:{lat:data.countryInfo.lat,lng:data.countryInfo.long};
      setMapCenter(mmapCenter);
      setMapZoom(4)
    })
  }



  return (
    <div className="App">
      <div className='app_left'>
      <div className="app_header">
        <h1>COVID-19 TRACKER </h1>
        <FormControl className="app_dropdown">
          <Select varient="outlined" onChange={onCountryChange} value={country}>
            <MenuItem value="worldwide">WorldWide</MenuItem>
            {
              countries.map(country=>(
                <MenuItem value={country.value}>{country.name}</MenuItem>
              ))
            }
          </Select>
        </FormControl>
      </div>
      <div className="app_status">
      <InfoBox isRed={true} active={casesType==='cases'} onClick={e=>setCasesType('cases')} title='Coronavirus cases' total={prettyPrintStat(countryInfo.cases)} 
      cases={ prettyPrintStat(countryInfo.todayCases)}/>
      <InfoBox isRed={false} active={casesType==='recovered'}  onClick={e=>setCasesType('recovered')} title='Recovered' total={prettyPrintStat(countryInfo.recovered)} 
      cases={prettyPrintStat(countryInfo.todayRecovered)}/>
      <InfoBox isRed={true} active={casesType==='deaths'}  onClick={e=>setCasesType('deaths')} title='Deaths' total={prettyPrintStat(countryInfo.deaths)} 
      cases={prettyPrintStat(countryInfo.todayDeaths)}/>

      </div>

      <Map casesType={casesType} countries={mapCountries} center={mapCenter} zoom={mapZoom}/>
      </div>
      <Card className="app_right">
        <CardContent>
          <h3>Live Content by Country</h3>
          <Table countries={tableData}/>
          <h3 className="app_graphTitle">Worldwide new {casesType}</h3>
          <LineGraph className="app_graph" casesType={casesType}/>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
