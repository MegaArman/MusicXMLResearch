"use strict";
const et = require("elementtree");

//-----------------------------------
//TODO call partsBeatMaps???
const createIterator = (parts) =>
{
  const iterator = {};
  
  //TODO make a function that sets these for debugging purposes/code clean
  let measures = [];
  let measureNum = 0;
  let beatMap = measures[0];
  let beatIndex = -1;
  let selectedInstrumentName;

  const errors =  
  {
    "noNext": "no next exists!",
    "noPrev": "no prev exists!",
    "badMeasure": "measure does not exist!"
  };

  iterator.selectInstrument = (instrumentName) =>
  {
    if (instrumentName in parts)
    {
      selectedInstrumentName = instrumentName;
      measures = parts[selectedInstrumentName];
      beatMap = measures[0];
      beatIndex = -1;
      return true;
    }
    else
    {
     //TODO should an error be thrown???
     return false;
    }
  };

  iterator.getSelectedInstrumentName = () => selectedInstrumentName;

  iterator.getMeasureNum = () => measureNum + 1;

  iterator.setMeasureNum = (newMeasureNum) =>
  {
    if (newMeasureNum <= 0 || newMeasureNum > measures.length)
    {
      throw new Error(errors.badMeasure);
    }
    measureNum = newMeasureNum - 1;
    beatMap = measures[measureNum];
    beatIndex = -1;
  };

  iterator.nextMeasure = () =>
  { 
    if (measureNum === measures.length - 1)
    {
      throw new Error(errors.noNext);
    }
    beatMap = measures[++measureNum];
    beatIndex = 0;
    return beatMap[0];
  };

  iterator.prevMeasure = () =>
  {
    if (measureNum === 0)
    {
      throw new Error(errors.noPrev);
    }
    beatMap = measures[--measureNum];
    beatIndex = 0;
    return beatMap[0];
  };

  iterator.next = () =>
  {
   if (beatIndex === beatMap.length - 1)
   {
    iterator.nextMeasure();
    return beatMap[beatIndex];
   }
   return beatMap[++beatIndex];
  };

  iterator.hasNext = () =>
  {
    return (beatIndex < beatMap.length - 1 
            ||  measureNum < measures.length - 1);
  };

  iterator.prev = () =>
  {
    if (beatIndex === 0)
    {
      iterator.prevMeasure();
      beatIndex = beatMap.length - 1;
      return beatMap[beatIndex];
    }
    return beatMap[--beatIndex];
  };

  iterator.hasPrev = () =>
  {
    return (beatIndex > 0 ||  measureNum > 0);
  };

  return iterator;
};

const constructor = (musicxml) =>
{
  const etree = et.parse(musicxml);
  const partNames = etree.findall(".//part-name")
                   .map((partName) => partName.text);

  const parts = etree.findall(".//part").reduce((acc, val, index) =>
  {
    acc[partNames[index]] = val.findall(".//measure").map((measure) => 
    {
      const beats = [];
      let currentBeat = 1;
      //const voices = {};
        
      measure._children.forEach((child) => 
      {
        if (child.tag === "note")
        {
          //const voice = child.findtext(".//voice");

          const symbol = {};
          symbol.beat = currentBeat;
          symbol.duration =  parseInt(child.findtext(".//duration")); 

          if (child.findtext("[rest]"))
          {
            symbol.rest = true; 
          }
          else
          { 
            const step = child.findtext(".//step");
            const accidentals = child.findall(".//accidental");
            const octave = child.findtext(".//octave");
            let noteString = step;
            accidentals.forEach((accidental) => 
            {
              if (accidental.text === "flat")
              {
                noteString += "b";
              }
              else if (accidental.text === "sharp")
              {
                noteString += "#";
              }
            });
            noteString += octave;
            symbol.note = noteString;
          }

          beats.push(symbol);
          currentBeat += symbol.duration;
         // if (child.findtext("[chord]"))
         // {
         //   
         // }
         // !(voice in voices) ? 
          //voices[voice] = duration : voices[voice] += duration;

          //console.log("note", child.findtext(".//duration"));
        }
        else if (child.tag === "backup")
        {
        //  console.log("backup", child.findtext(".//duration"));
        }
        else if (child.tag === "forward")
        {
          //console.log("forward", child.findtext(".//duration"));
        }
      });

      return beats;
    });

    return acc;
  }, {});
   
  return createIterator(parts);
};

module.exports = constructor;
