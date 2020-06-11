function makeBookmarksArray(){
  return [
    {
      id:1,
      title: 'Google',
      url: 'http://google.com',
      description: 'An indie search engine startup',
      rating: 4
    },
    {
      id:2,
      title: 'Fluffiest Cats in the World',
      url: 'http://medium.com/bloggerx/fluffiest-cats-334',
      description: 'The only list of fluffy cats online',
      rating: 5
    },
    {
      id:3,
      title:'No description',
      url:'http://nodescription.com',
      description:'',
      rating:1
    }
  ];
}

module.exports= {
  makeBookmarksArray,
}