export default function startUpTour () {
  const imagePath = './src/components/widgets/FeatureTour/images/'
  const content = {
    id: 'startupTour',
    showPrevButton: true,
    bubbleWidth: 450,
    onClose: ['clearState'],
    onEnd: ['clearState'],
    steps: [
      {
        title: 'Welcome at the first-run tour of JAM.',
        content: `<img src='${imagePath}bunny.jpg' class='featureTourImage imageLeft'><p>The purpose of this tour is to show you how to make the best use of JAM.</p>`,
        target: document.querySelector('#overlayContainer'),
        placement: 'bottom',
        xOffset: 'center',
        arrowOffset: 'center',
        onShow: ['hideArrow']
      },
      {
        title: 'Assemblies',
        content: `<img src='${imagePath}solar_system.jpg' class='featureTourImage imageRight'>You can use JAM to make assemblies. In an assembly you put your parts together as they would be in real life. This way other people can see what the end result looks like and as a bonus other people can see how to put it together themselves. `,
        target: document.querySelector('#overlayContainer'),
        placement: 'bottom',
        xOffset: 'center',
        arrowOffset: 'center',
        onShow: ['hideArrow']
      },
      {
        title: 'My content',
        content: '(this step only shows when no model is loaded) First let’s load a model by dragging it into JAM or click here to load an example model.',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      },
      {
        title: 'My content',
        content: 'You select a part by clicking it. When a part is selected, it has a thick black outline. Unselect the part by clicking it again.',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      },
      {
        title: 'My content',
        content: 'Click here to see a list of all of your parts.',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      },
      {
        title: 'My content',
        content: 'You can also add parts which do not exist as a 3D file, for example tape, bolts or glue. These parts are usually not-printable.',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      },
      {
        title: 'My content',
        content: 'When you click one of these you can copy the bill of materials as a text- or json file. You can look at this file as a to-print-and-to-get-list.',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      },
      {
        title: 'My content',
        content: 'Here on the left, you find all the tools which you use to edit or manipulate your model. Pro tip: You can manipulate multiple parts at the same time by simply selecting multiple parts. ',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      },
      {
        title: 'My content',
        content: 'With the translate tool, you move parts around on the build area. When snap translation is selected, the position snaps to rounded mm’s.',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      },
      {
        title: 'My content',
        content: 'You use the rotate tool to make sure that your parts are in the right orientation. When snap snap rotation is selected, it snaps to rounded degrees.',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      },
      {
        title: 'My content',
        content: 'You can probably already guess what the scaling and the snap-scaling functionalities do. Uniform scaling makes sure that you can scale the model, but it stays in its original dimensions. So all sides are scaled equally. ',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      },
      {
        title: 'My content',
        content: 'With the mirror tool, you can mirror you part along the x, y and z axis.',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      },
      {
        title: 'My content',
        content: 'These two tools are used to duplicate or delete a part.',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      },
      {
        title: 'My content',
        content: 'Give your parts different colours to make your assembly even more life-like. ',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      },
      {
        title: 'Perform measureents',
        content: 'The last of the tools is to perform measurements on your model. You could for example measure how wide a part is and compare that to other parts.',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      },
      {
        title: 'My content',
        content: 'In the bottom right, you find everything regarding help and settings. ',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      },
      {
        title: 'My content',
        content: 'With this button you can toggle between the regular screen and a full screen view. ',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      },
      {
        title: 'My content',
        content: 'You can access various settings here. ',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      },
      {
        title: 'My content',
        content: 'Click here for extra information on JAM or to start this startup tour again. ',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      },
      {
        title: 'My content',
        content: 'This is the end of the start-up tour. Thank you for joining.',
        target: document.querySelector('.bomtoggler'),
        placement: 'left'
      }
    ]
  }
  return content
}
