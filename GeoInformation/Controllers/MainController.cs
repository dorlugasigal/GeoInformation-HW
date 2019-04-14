using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace GeoInformationHw.Controllers
{
    [RoutePrefix("api")]
    public class MainController : ApiController
    {

        [Route("Test"), HttpGet]
        public string Test()
        {
            return "The server is working!";
        }

    }
}
